import { mat4, vec3, vec4 } from "wgpu-matrix"
import { makeObservable, observable } from "mobx";
import {
  ContainerNodeInterface,
  ParticleSystemInterface,
} from "../types";
import DrawableNode from "../Drawables/SceneNodes/DrawableNode";
import { degToRad, gravity, intersectionPlane } from "../Math";
import DrawableInterface from "../Drawables/DrawableInterface";
import Billboard from "../Drawables/Billboard";
import { MaterialDescriptor } from "../Materials/MaterialDescriptor";
import PSColor from "./PSColor";
import Http from "../../Http/src";
import PSValue from "./PSValue";
import Particle from "./Particle";
import LifetimeColor from "./LifetimeColor";
import { ParticleSystemDescriptor } from "./Types";

class ParticleSystem implements ParticleSystemInterface {
  id: number

  particles: Particle[] = []

  duration: number;

  maxPoints: number

  rate: number

  startTime = 0;

  lastEmitTime = 0;

  lifetime: PSValue;

  angle: number;

  startVelocity: PSValue;

  startSize: PSValue;

  startColor: PSColor;

  lifetimeColor: LifetimeColor;

  lifetimeSize: PSValue; // Size over lifetime

  originRadius: number;

  gravityModifier: PSValue;

  collisionEnabled: boolean;

  bounce: number;

  dampen: number;

  materialId: number | undefined = undefined;

  materialDescriptor: MaterialDescriptor | number | undefined;

  drawable: DrawableInterface | null = null;

  private constructor(id: number, descriptor?: ParticleSystemDescriptor) {
    this.id = id

    this.duration = descriptor?.duration ?? 5
    this.rate = descriptor?.rate ?? 10
    this.maxPoints = descriptor?.maxPoints ?? 50

    this.lifetime = PSValue.fromDescriptor(descriptor?.lifetime, this.onChange);

    this.angle = descriptor?.angle ?? 25
    this.originRadius = descriptor?.originRadius ?? 1

    this.startVelocity = PSValue.fromDescriptor(descriptor?.startVelocity, this.onChange);
    this.startSize = PSValue.fromDescriptor(descriptor?.startSize, this.onChange);
    
    this.lifetimeSize = PSValue.fromDescriptor(descriptor?.lifetimeSize, this.onChange);

    this.startColor = PSColor.fromDescriptor(descriptor?.startColor, this.onChange)
    this.lifetimeColor = LifetimeColor.fromDescriptor(descriptor?.lifetimeColor, this.onChange)

    this.gravityModifier = PSValue.fromDescriptor(descriptor?.gravityModifier);

    this.collisionEnabled = descriptor?.collisionEnabled ?? false;
    this.bounce = descriptor?.bounce ?? 1;
    this.dampen = descriptor?.dampen ?? 0;

    this.materialId = descriptor?.materialId
    this.materialDescriptor = descriptor?.materialId

    makeObservable(this, {
      lifetime: observable,
      startVelocity: observable,
      startSize: observable,
      lifetimeSize: observable,
      startColor: observable,
      gravityModifier: observable,
      collisionEnabled: observable,
    })
  }

  static async create(id: number, descriptor?: ParticleSystemDescriptor) {
    return new ParticleSystem(id, descriptor)
  }

  reset() {
    this.startTime = 0;
    this.lastEmitTime = 0
    this.particles = []
  }

  collided(point: Particle, elapsedTime: number, scene: ContainerNodeInterface): boolean {
    if (this.collisionEnabled) {
      const planeNormal = vec4.create(0, 1, 0, 0);
      const planeOrigin = vec4.create(0, 0, 0, 1);

      const sphereRadius = point.startSize / 2;

      // Are we traveling toward the plane or away?
      const d = vec4.dot(planeNormal, point.velocity);
      if (d <= 0) {
        // We are traveling toward the plane. Continue with collision detection.

        // Find the point on the sphere that will collide with the plane if
        // we travel far enough.
        const sphereIntersectionPoint = vec4.subtract(
          vec4.create(...point.drawable.translate, 1),
          vec4.scale(
            planeNormal,
            sphereRadius,
          )
        )

        // Find the point on the plane that we will collide with if we travel far enough.
        const planeInterSectionPoint = intersectionPlane(planeOrigin, planeNormal, sphereIntersectionPoint, vec4.normalize(point.velocity));

        if (planeInterSectionPoint) {
          // Will we travel fare enough to hit the plane?
          const distanceToCollision = vec3.distance(sphereIntersectionPoint, planeInterSectionPoint)
          const distanceToDestination = vec3.length(vec4.scale(point.velocity, elapsedTime))

          // Compute the sphere origin to collision point distance for those cases where the sphere has already
          // partially embedded in the plane.
          const originToCollision = vec3.distance(point.drawable.translate, planeInterSectionPoint)

          if (distanceToCollision < distanceToDestination || originToCollision < sphereRadius) {
            // Yes, the sphere and plane will collide
            // if (false) {
            //   scene.removeNode(point.drawable);
            
            //   this.points = [
            //     ...this.points.slice(0, i),
            //     ...this.points.slice(i + 1),
            //   ]
      
            //   i -= 1
      
            //   continue  
            // }
  
            // TODO: Improve calculation of point/time of collision and
            // movement along new vector with remaining time.
  
            // Compute the reflection vector and account for how much bounce.
            const dot = vec4.dot(point.velocity, planeNormal);

            point.velocity = vec4.subtract(point.velocity, vec4.scale(planeNormal, dot + dot * this.bounce))

            // Allow the collision to dampen the velocity
            point.velocity = vec4.scale(point.velocity, 1 - this.dampen)  

            // Move the sphere to the intersection point
            // offset by the radius of the sphere along the plane normal.
            const newlocation = vec4.add(
              planeInterSectionPoint,
              vec4.scale(
                planeNormal,
                point.startSize / 2,
              )    
            )

            point.drawable.translate = vec3.create(...newlocation.slice(0,3));

            const percentRemaining = 1 - distanceToCollision / distanceToDestination;

            // Add remaing amount to travel
            point.drawable.translate = vec3.addScaled(
              point.drawable.translate,
              point.velocity,
              elapsedTime * percentRemaining,
            );  

            return true;
          }
        }
      }
    }

    return false;
  }

  async update(time: number, elapsedTime: number, scene: ContainerNodeInterface): Promise<void> {
    if (!this.drawable) {
      this.drawable = new Billboard()
      console.log('created particle drawable')
    }

    if (this.startTime === 0) {
      this.startTime = time;
    }

    const elapsedTime2 = ((time - this.startTime) / 1000.0) % this.duration / this.duration;

    if (this.lastEmitTime === 0) {
      this.lastEmitTime = time;

      this.emitSome(1, time, elapsedTime2, scene)
      return
    }

    // Update existing particles
    this.updateParticles(time, elapsedTime, scene);
  
    // Add new particles
    await this.emit(time, elapsedTime2, scene)
  }

  private updateParticles(time: number, elapsedTime: number, scene: ContainerNodeInterface) {
    for (let i = 0; i < this.particles.length; i +=1) {
      const particle = this.particles[i];

      const t = (time - particle.startTime) / (particle.lifetime * 1000);

      if (t > 1.0) {
        scene.removeNode(particle.drawable);
        
        this.particles = [
          ...this.particles.slice(0, i),
          ...this.particles.slice(i + 1),
        ]

        i -= 1

        continue
      }

      // Adjust velocity with gravity
      particle.velocity = vec4.addScaled(
        particle.velocity,
        [0, 1, 0, 0],
        this.gravityModifier.getValue(t) * gravity * elapsedTime,
      )

      if (!this.collided(particle,  elapsedTime, scene)) {
        // No collision occured
        // Find new position with current velocity
        particle.drawable.translate = vec3.addScaled(
          particle.drawable.translate,
          particle.velocity,
          elapsedTime,
        );
      }

      const size = this.lifetimeSize.getValue(t) * particle.startSize;
      particle.drawable.scale = vec3.create(size, size, size)

      let lifetimeColor = [1, 1, 1, 1];

      if (this.lifetimeColor.enabled) {
        lifetimeColor = this.lifetimeColor.color.getColor(t);
      }

      particle.drawable.color[0] = lifetimeColor[0] * particle.startColor[0];
      particle.drawable.color[1] = lifetimeColor[1] * particle.startColor[1];
      particle.drawable.color[2] = lifetimeColor[2] * particle.startColor[2];
      particle.drawable.color[3] = lifetimeColor[3] * particle.startColor[3];
    }
  }

  private async emit(time: number, t: number, scene: ContainerNodeInterface) {
    if (this.particles.length < this.maxPoints) {
      const emitElapsedTime = time - this.lastEmitTime;

      let numToEmit = Math.min(Math.trunc((this.rate / 1000) * emitElapsedTime), this.maxPoints - this.particles.length);

      if (numToEmit > 0) {
        this.lastEmitTime = time;
      
        await this.emitSome(numToEmit, time, t, scene)
      }
    }
  }

  async emitSome(numToEmit: number, startTime: number, t: number, scene: ContainerNodeInterface) {
    for (; numToEmit > 0; numToEmit -= 1) {
      const lifetime = this.lifetime.getValue(t);
      const startVelocity = this.startVelocity.getValue(t);
      const startSize = this.startSize.getValue(t);
      const startColor = this.startColor.getColor(t);

      const drawable = await DrawableNode.create(this.drawable!, this.materialDescriptor);

      let origin = vec4.create(0, 0, 0, 1)

      // const offset = Math.random() * this.originRadius;
      const offset = this.originRadius;
      const rotate = degToRad(Math.random() * 360);

      let transform = mat4.identity()
      mat4.rotateY(transform, rotate, transform)
      mat4.translate(transform, vec4.create(0, 0, offset, 1), transform)
      vec4.transformMat4(origin, transform, origin)

      // drawable.translate = vec3.add(origin, vec3.create(0, 1, 0));
      drawable.translate = origin;

      drawable.scale = vec3.create(startSize, startSize, startSize);

      scene.addNode(drawable)

      // const vector = vec4.create(0, 1, 0, 0)

      // transform = mat4.identity()
      // mat4.rotateY(transform, degToRad(Math.random() * 360), transform)
      // mat4.rotateX(transform, degToRad(this.angle), transform)
      // vec4.transformMat4(vector, transform, vector)

      const p1 = vec4.create(0, 1, 0, 1);

      transform = mat4.identity()
      mat4.rotateY(transform, rotate, transform)
      mat4.translate(transform, vec4.create(0, 0, offset, 1), transform)
      mat4.rotateX(transform, degToRad(this.angle), transform)
      vec4.transformMat4(p1, transform, p1)

      const direction = vec4.subtract(p1, origin)

      const particle = new Particle(
        vec4.scale(direction, startVelocity),
        startTime,
        lifetime,
        drawable,
        startSize,
        startColor,
      )

      this.particles.push(particle)
    }
  }

  removeParticles(scene: ContainerNodeInterface): void {
    for (const particle of this.particles) {
      scene.removeNode(particle.drawable)
    }
  }

  toDescriptor(): ParticleSystemDescriptor {
    return ({
      duration: this.duration,
      maxPoints: this.maxPoints,
      rate: this.rate,
      angle: this.angle,
      originRadius: this.originRadius,
      lifetime: this.lifetime.toDesriptor(),
      startVelocity: this.startVelocity.toDesriptor(),
      startSize: this.startSize.toDesriptor(),
      lifetimeSize: this.lifetimeSize.toDesriptor(),
      startColor: this.startColor.toDescriptor(),
      lifetimeColor: this.lifetimeColor.toDescriptor(),
      gravityModifier: this.gravityModifier,
      collisionEnabled: this.collisionEnabled,
      bounce: this.bounce,
      dampen: this.dampen,
      materialId: this.materialId,
    })
  }

  async save() {
    const response = await Http.patch(`/particles/${this.id}`, {
      descriptor: this.toDescriptor(),
    })

    if (response.ok) {

    }
  }

  onChange = () => {
    this.save();
  }
}

export default ParticleSystem
