import { vec3, vec4 } from "wgpu-matrix"
import { makeObservable, observable, runInAction } from "mobx";
import {
  SceneNodeInterface,
  DrawableType,
  MaterialInterface,
  ParticleSystemInterface,
  ComponentType,
  ComponentDescriptor,
} from "../types";
import DrawableComponent from "../Drawables/DrawableComponent";
import { gravity, intersectionPlane } from "../Math";
import DrawableInterface from "../Drawables/DrawableInterface";
import Billboard from "../Drawables/Billboard";
import PSColor from "./PSColor";
import Http from "../../Http/src";
import PSValue from "./PSValue";
import Particle from "./Particle";
import LifetimeColor from "./LifetimeColor";
import { ParticleSystemDescriptor, PSValueType, RenderMode, ShapeType } from "./Types";
import Shape from "./Shapes/Shape";
import LifetimeSize from "./LIfetimeSize";
import Collision from "./Collision";
import Renderer from "./Renderer";
import HorizontalBillboard from "../Drawables/HorizontalBillboard";
import { materialManager } from "../Materials/MaterialManager";
import MaterialItem from "../MaterialItem";
import { MaterialItemInterface } from "../../State/types";
import LifetimeVelocity from "./LifetimeVelocity";
import SceneNode from "../Drawables/SceneNodes/SceneNode";
import Component from "../Drawables/Component";

class ParticleSystem extends Component implements ParticleSystemInterface {
  id: number

  particles: Map<number, Particle> = new Map();

  duration: number;

  maxPoints: number

  rate: number

  shape: Shape;

  startTime = 0;

  lastEmitTime = 0;

  lifetime: PSValue;

  startVelocity: PSValue;

  startSize: PSValue;

  startColor: PSColor;

  lifetimeColor: LifetimeColor;

  lifetimeSize: LifetimeSize;

  lifetimeVelocity: LifetimeVelocity;

  gravityModifier: PSValue;

  collision: Collision;

  renderer: Renderer;

  materialItem?: MaterialItemInterface;

  drawable: DrawableInterface | null = null;

  private constructor(id: number, descriptor?: ParticleSystemDescriptor, materialItem?: MaterialItem) {
    super(ComponentType.ParticleSystem)
  
    this.id = id

    this.duration = descriptor?.duration ?? 5
    this.rate = descriptor?.rate ?? 2
    this.maxPoints = descriptor?.maxPoints ?? 50

    this.lifetime = PSValue.fromDescriptor(descriptor?.lifetime ?? { type: PSValueType.Constant, value: [5, 5] }, this.handleChange);

    this.shape = Shape.fromDescriptor(descriptor?.shape ?? { enabled: true, type: ShapeType.Cone, }, this.handleChange);

    this.startVelocity = PSValue.fromDescriptor(descriptor?.startVelocity, this.handleChange);
    this.startSize = PSValue.fromDescriptor(descriptor?.startSize, this.handleChange);
    
    this.lifetimeSize = LifetimeSize.fromDescriptor(descriptor?.lifetimeSize, this.handleChange);

    this.lifetimeVelocity = LifetimeVelocity.fromDescriptor(descriptor?.lifetimeVelocity, this.handleChange);

    this.startColor = PSColor.fromDescriptor(descriptor?.startColor, this.handleChange)
    this.lifetimeColor = LifetimeColor.fromDescriptor(descriptor?.lifetimeColor, this.handleChange)

    this.gravityModifier = PSValue.fromDescriptor(
      descriptor?.gravityModifier ?? {
        type: PSValueType.Constant,
        value: [0, 0],
      },
      this.handleChange,
    );

    this.collision = Collision.fromDescriptor(descriptor?.collision, this.handleChange)

    this.renderer = Renderer.fromDescriptor(
      descriptor?.renderer ?? { enabled: true, mode: RenderMode.Billboard },
      this.handleChange
    );

    this.materialItem = materialItem;

    makeObservable(this, {
      lifetime: observable,
      startVelocity: observable,
      startSize: observable,
      lifetimeSize: observable,
      startColor: observable,
      gravityModifier: observable,
      materialItem: observable,
    })
  }

  static async create(id: number, descriptor?: ParticleSystemDescriptor) {
    let materialItem: MaterialItem | undefined = undefined;

    if (descriptor?.materialId !== undefined) {
      materialItem = await materialManager.getItem(descriptor?.materialId)
    }

    return new ParticleSystem(id, descriptor, materialItem)
  }

  reset() {
    this.startTime = 0;
    this.lastEmitTime = 0
    this.particles.clear()
  }

  collided(point: Particle, elapsedTime: number, scene: SceneNodeInterface): boolean {
    if (this.collision.enabled) {
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
          vec4.create(...point.position, 1),
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
          const originToCollision = vec3.distance(point.position, planeInterSectionPoint)

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

            point.velocity = vec4.subtract(point.velocity, vec4.scale(planeNormal, dot + dot * this.collision.bounce))

            // Allow the collision to dampen the velocity
            point.velocity = vec4.scale(point.velocity, 1 - this.collision.dampen)  

            // Move the sphere to the intersection point
            // offset by the radius of the sphere along the plane normal.
            const newlocation = vec4.add(
              planeInterSectionPoint,
              vec4.scale(
                planeNormal,
                point.startSize / 2,
              )    
            )

            point.position = vec3.create(...newlocation.slice(0,3));

            const percentRemaining = 1 - distanceToCollision / distanceToDestination;

            // Add remaing amount to travel
            point.position = vec3.addScaled(
              point.position,
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

  async update(time: number, elapsedTime: number, scene: SceneNodeInterface): Promise<void> {
    switch (this.renderer.mode) {
      case RenderMode.Billboard:
        if (!this.drawable || this.drawable.type !== 'Billboard') {
          this.drawable = new Billboard()
        }

        break;

      case RenderMode.FlatBillboard:
        if (!this.drawable || this.drawable.type !== 'HorizontalBillboard') {
          this.drawable = new HorizontalBillboard()
        }

        break;
    }

    if (this.startTime === 0) {
      this.startTime = time;
    }

    const elapsedTime2 = ((time - this.startTime) / 1000.0) % this.duration / this.duration;

    if (this.lastEmitTime === 0) {
      this.lastEmitTime = time;

      await this.emitSome(1, time, elapsedTime2, scene)
    }
    else {
      // Update existing particles
      await this.updateParticles(time, elapsedTime, scene);
    
      // Add new particles
      await this.emit(time, elapsedTime2, scene)
    }
  }

  private async updateParticles(time: number, elapsedTime: number, scene: SceneNodeInterface) {
    for (const [, particle] of this.particles) {
      const t = (time - particle.startTime) / (particle.lifetime * 1000);

      if (t > 1.0) {
        if (particle.sceneNode && this.sceneNode) {
          this.sceneNode.removeNode(particle.sceneNode);
          particle.sceneNode = null;
        }
        
        this.particles.delete(particle.id)    
      }
      else {
        // Adjust velocity with gravity
        particle.velocity = vec4.addScaled(
          particle.velocity,
          [0, 1, 0, 0],
          this.gravityModifier.getValue(t) * gravity * elapsedTime,
        )

        if (this.lifetimeVelocity.enabled) {
          particle.velocity = vec4.scale(particle.velocity, this.lifetimeVelocity.speedModifier.getValue(t));
        }

        if (!this.collided(particle,  elapsedTime, scene)) {
          // No collision occured
          // Find new position with current velocity
          particle.position = vec3.addScaled(
            particle.position,
            particle.velocity,
            elapsedTime,
          );
        }

        await this.renderParticle(particle, scene, t);
      }
    }
  }

  async renderParticle(particle: Particle, scene: SceneNodeInterface, t: number) {
    if (this.renderer.enabled && this.sceneNode) {
      if (particle.sceneNode === null) {
        particle.sceneNode = new SceneNode();
        this.sceneNode.addNode(particle.sceneNode)  
      }

      if (particle.drawable === null) {
        particle.drawable = await DrawableComponent.create(this.drawable!, this.materialItem);
        particle.sceneNode.addComponent(particle.drawable);
      }

      particle.sceneNode.translate = particle.position;

      let size = particle.startSize;

      if (this.lifetimeSize.enabled) {
        size *= this.lifetimeSize.size.getValue(t);
      }

      particle.sceneNode.scale = vec3.create(size, size, size)

      let lifetimeColor = [1, 1, 1, 1];

      if (this.lifetimeColor.enabled) {
        lifetimeColor = this.lifetimeColor.color.getColor(t);
      }

      particle.drawable.color[0] = lifetimeColor[0] * particle.startColor[0];
      particle.drawable.color[1] = lifetimeColor[1] * particle.startColor[1];
      particle.drawable.color[2] = lifetimeColor[2] * particle.startColor[2];
      particle.drawable.color[3] = lifetimeColor[3] * particle.startColor[3];    
    }
    else if (particle.sceneNode !== null && this.sceneNode !== null) {
      this.sceneNode.removeNode(particle.sceneNode);
      particle.sceneNode = null;
    }
  }

  private async emit(time: number, t: number, scene: SceneNodeInterface) {
    if (this.particles.size < this.maxPoints) {
      const emitElapsedTime = time - this.lastEmitTime;

      let numToEmit = Math.min(Math.trunc((this.rate / 1000) * emitElapsedTime), this.maxPoints - this.particles.size);

      if (numToEmit > 0) {
        this.lastEmitTime = time;
      
        await this.emitSome(numToEmit, time, t, scene)
      }
    }
  }

  async emitSome(numToEmit: number, startTime: number, t: number, scene: SceneNodeInterface) {
    for (; numToEmit > 0; numToEmit -= 1) {
      const lifetime = this.lifetime.getValue(t);
      const startVelocity = this.startVelocity.getValue(t);
      const startSize = this.startSize.getValue(t);
      const startColor = this.startColor.getColor(t);
      const [position, direction] = this.shape.getPositionAndDirection();

      const particle = new Particle(
        position,
        vec4.scale(direction, startVelocity),
        startTime,
        lifetime,
        startSize,
        startColor,
      )

      this.particles.set(particle.id, particle)

      await this.renderParticle(particle, scene, 0);
    }
  }

  removeParticles(scene: SceneNodeInterface): void {
    for (const [id, particle] of this.particles) {
      if (particle.sceneNode && this.sceneNode) {
        this.sceneNode.removeNode(particle.sceneNode)
        particle.sceneNode = null;
      }

      this.particles.delete(id)
    }
  }

  toDescriptor(): ComponentDescriptor {
    return ({
      type: this.type,
      item: {
        duration: this.duration,
        maxPoints: this.maxPoints,
        rate: this.rate,
        shape: this.shape.toDescriptor(),
        lifetime: this.lifetime.toDescriptor(),
        startVelocity: this.startVelocity.toDescriptor(),
        startSize: this.startSize.toDescriptor(),
        lifetimeSize: this.lifetimeSize.toDescriptor(),
        startColor: this.startColor.toDescriptor(),
        lifetimeColor: this.lifetimeColor.toDescriptor(),
        gravityModifier: this.gravityModifier.toDescriptor(),
        collision: this.collision.toDescriptor(),
        renderer: this.renderer.toDescriptor(),
        materialId: this.materialItem?.id,
      }
    })
  }

  getDrawableType(): DrawableType | undefined {
    switch(this.renderer.mode) {
      case RenderMode.Billboard:
        return 'Billboard'

      case RenderMode.FlatBillboard:
        return 'HorizontalBillboard';
    }
  }

  async setMaterial(materialItem: MaterialItemInterface) {
    let material: MaterialInterface | undefined = undefined;

    const drawableType = this.getDrawableType();
    if (drawableType) {
      material = await materialManager.get(materialItem, drawableType, []);
    }

    runInAction(() => {
      this.materialItem = materialItem;

      for (const [, particle] of this.particles) {
        if (particle.drawable && material) {
          particle.drawable.material = material;
        }
      }
      
      this.save();
    })
  }

  async save() {
    const response = await Http.patch(`/particles/${this.id}`, {
      descriptor: this.toDescriptor(),
    })

    if (response.ok) {

    }
  }

  handleChange = () => {
    if (this.onChange) {
      this.onChange();
    }
  }
}

export default ParticleSystem
