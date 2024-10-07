import { mat4, vec3, vec4 } from "wgpu-matrix"
import type {
  ParticleSystemInterface} from "../Types";
import {
  ComponentType,
} from "../Types";
import { degToRad, gravity, intersectionPlane } from "../Math";
import Particle from "./Particle";
import RenderNode from "../Drawables/SceneNodes/RenderNode";
import Component from "../Drawables/Component";
import type { ParticleSystemPropsInterface } from "./ParticleSystemPropsInterface";
import { RenderMode, SpaceType } from "./Types";
import type Camera from "../Camera";

class ParticleSystem extends Component implements ParticleSystemInterface {
  props: ParticleSystemPropsInterface

  particles: Map<number, Particle> = new Map();

  initializationTime: number | null = null;

  startTime = 0;

  nextEmitTime = 0;

  rootNode = new RenderNode();

  constructor(props: ParticleSystemPropsInterface) {
    super(ComponentType.ParticleSystem)
  
    this.props = props;
  }

  collided(point: Particle, elapsedTime: number): boolean {
    if (this.props.collision.enabled.get()) {
      const planeNormal = vec4.create(0, 1, 0, 0);
      const planeOrigin = vec4.create(0, 0, 0, 1);

      // TODO: consider all start size axis
      const sphereRadius = point.startSize[0] / 2;

      // Are we traveling toward the plane or away?
      const d = vec4.dot(planeNormal, point.velocity);
      if (d <= 0) {
        // We are traveling toward the plane. Continue with collision detection.

        // Find the point on the sphere that will collide with the plane if
        // we travel far enough.
        const intersectionPointOnSphere = vec4.subtract(
          point.position,
          vec4.scale(
            planeNormal,
            sphereRadius,
          )
        )

        // Find the point on the plane that we will collide with if we travel far enough.
        const intersectionPointOnPlane = intersectionPlane(planeOrigin, planeNormal, intersectionPointOnSphere, vec4.normalize(point.velocity));

        if (intersectionPointOnPlane) {
          // Will we travel far enough to hit the plane?
          const distanceToCollision = vec3.distance(intersectionPointOnSphere, intersectionPointOnPlane)
          const distanceToDestination = vec3.length(vec4.scale(point.velocity, elapsedTime))

          // Compute the sphere origin to collision point distance for those cases where the sphere has already
          // partially embedded in the plane.
          const originToCollision = vec3.distance(point.position, intersectionPointOnPlane)

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
            // The dot product is the magnitude of the velocity projected on to the plane normal
            // Subtracting a vector along the plane normal of that magnituted twice will give us the
            // reflection vector. Subtracting only once will give us a vector along the plane (no bounce).
            // Thus, the reason for scaling the vector by dot + dot * bounce factor.
            const dot = vec4.dot(point.velocity, planeNormal);
            vec4.subtract(point.velocity, vec4.scale(planeNormal, dot + dot * this.props.collision.bounce.get()), point.velocity)

            // Allow the collision to dampen the velocity
            vec4.scale(point.velocity, 1 - this.props.collision.dampen.get(), point.velocity)  

            // Move the sphere to the intersection point
            // offset by the radius of the sphere along the plane normal.
            vec4.add(
              intersectionPointOnPlane,
              vec4.scale(
                planeNormal,
                sphereRadius,
              ),
              point.position,
            )

            const percentRemaining = 1 - distanceToCollision / distanceToDestination;

            // Add remaing amount to travel
            vec4.addScaled(
              point.position,
              point.velocity,
              elapsedTime * percentRemaining,
              point.position,
            );  

            return true;
          }
        }
      }
    }

    return false;
  }

  async update(time: number, elapsedTime: number, camera: Camera): Promise<void> {
    if (this.renderNode) {
      if (this.rootNode.parentNode === null) {
        this.renderNode.sceneGraph?.addNode(this.rootNode)
      }

      // Make sure the root node has the correct translate value
      // based on rendering space.
      if (this.props.space.get() === SpaceType.Local) {
        vec3.set(
          this.renderNode.transform[3 * 4 + 0],
          this.renderNode.transform[3 * 4 + 1],
          this.renderNode.transform[3 * 4 + 2],
          this.rootNode.translate,
        )
      }
      else {
        vec3.set(0, 0, 0, this.rootNode.translate)
      }

      this.rootNode.computeTransform(this.rootNode.parentNode?.transform)

      if (this.initializationTime === null || this.initializationTime >= time) {
        this.initializationTime = time;
        this.startTime = this.initializationTime + this.props.startDelay.get() * 1000.0;
        this.nextEmitTime = this.startTime;

        this.removeParticles()
      }

      // Update existing particles
      for (const [, particle] of this.particles) {
        await this.updateParticle(particle, time, camera);
      }

      if (time >= this.nextEmitTime && (this.props.loop.get() || this.nextEmitTime <= this.startTime + this.props.duration.get() * 1000)) {
        await this.emit(time, camera)
      }
    }
  }

  private async updateParticle(particle: Particle, time: number, camera: Camera) {
    const lifetimeT = (time - particle.startTime) / (particle.lifetime * 1000);

    if (lifetimeT > 1.0 || lifetimeT < 0.0) {
      // Particle's lifetime has expired. Remove the scene node from the graph
      // and delete the particle.
      if (particle.renderNode) {
        particle.renderNode.detachSelf();
        particle.renderNode = null;
      }
      
      this.particles.delete(particle.id)    
    }
    else {
      const elapsedSeconds = (time - particle.lastUpdateTime) / 1000.0;

      const gravityVector = vec4.create(0, 1, 0, 0)

      if (!this.renderNode) {
        throw new Error('renderNode is not set')
      }

      // Transform the position into world space to allow for gravity effect
      // and collision detection.
      // Note that velocity is already in world space
      vec4.transformMat4(particle.position, this.rootNode.transform, particle.position)

      // Adjust velocity with gravity
      vec4.addScaled(
        particle.velocity,
        gravityVector,
        this.props.gravityModifier.getValue(lifetimeT) * gravity * elapsedSeconds,
        particle.velocity,
      )

      if (this.props.lifetimeVelocity.enabled.get()) {
        particle.velocity = vec4.scale(particle.velocity, this.props.lifetimeVelocity.speedModifier.getValue(lifetimeT));
      }

      if (!this.collided(particle,  elapsedSeconds)) {
        // No collision occured
        // Find new position with current velocity
        vec4.addScaled(
          particle.position,
          particle.velocity,
          elapsedSeconds,
          particle.position,
        );
      }

      // Transform position back into local space.
      vec4.transformMat4(particle.position, this.rootNode.inverseTransform, particle.position)

      await this.renderParticle(particle, lifetimeT, camera);

      particle.lastUpdateTime = time;
    }
  }

  async renderParticle(particle: Particle, lifetimeT: number, camera: Camera) {
    if (this.props.renderer.enabled.get() && this.renderNode) {
      if (particle.renderNode === null) {
        particle.renderNode = new RenderNode();
      }

      if (particle.drawable === null) {
        particle.drawable = await this.props.renderer.createDrawableComponent()
        particle.renderNode.addComponent(particle.drawable);
      }

      vec3.copy(particle.position, particle.renderNode.translate);

      let lifetimeColor = [1, 1, 1, 1];

      if (this.props.lifetimeColor.enabled.get()) {
        lifetimeColor = this.props.lifetimeColor.color.getColor(lifetimeT);
      }

      particle.drawable.color[0] = lifetimeColor[0] * particle.startColor[0];
      particle.drawable.color[1] = lifetimeColor[1] * particle.startColor[1];
      particle.drawable.color[2] = lifetimeColor[2] * particle.startColor[2];
      particle.drawable.color[3] = lifetimeColor[3] * particle.startColor[3];   
      
      // If the particle's render node does not yet have a parent (its not attached to the scene graph)
      // then add it ot the particle system's root node and update the node's transforms.
      if (particle.renderNode.parentNode === null) {
        this.rootNode?.addNode(particle.renderNode);
        particle.renderNode.computeTransform(this.rootNode.transform)  
      }

      const cameraPosition = vec4.create(
        camera.viewTransform[3 * 4 + 0],
        camera.viewTransform[3 * 4 + 1],
        camera.viewTransform[3 * 4 + 2],
        camera.viewTransform[3 * 4 + 3],
      )
    
      // Transform the position into world space to allow for gravity effect
      // and collision detection.
      //const position = vec4.transformMat4(particle.position, this.rootNode.transform)
      const position = vec4.create(
        particle.renderNode.transform[3 * 4 + 0],
        particle.renderNode.transform[3 * 4 + 1],
        particle.renderNode.transform[3 * 4 + 2],
        particle.renderNode.transform[3 * 4 + 3],
      )

      const transform = mat4.identity()

      let lookAt = vec3.normalize(vec4.subtract(cameraPosition, position))

      if (this.props.renderer.mode.get() === RenderMode.Billboard) {
        let up = vec3.create(0, 1, 0);
        let right = vec3.create(1, 0, 0)

        // const dot = vec3.dot(up, lookAt);

        // console.log(dot);

        // if (dot < 0.75) {
          right = vec3.normalize(vec3.cross(up, lookAt));
          up = vec3.normalize(vec3.cross(lookAt, right));
        // }
        // else {
        //   up = vec3.normalize(vec3.cross(lookAt, right));
        //   right = vec3.normalize(vec3.cross(up, lookAt));
        // }

        mat4.setAxis(transform, right, 0, transform)
        mat4.setAxis(transform, up, 1, transform)
        mat4.setAxis(transform, lookAt, 2, transform)  
      }
      else if (this.props.renderer.mode.get() === RenderMode.StretchedBillboard) {
        const up = vec3.normalize(particle.velocity)
        const right = vec3.normalize(vec3.cross(up, lookAt));
        lookAt = vec3.normalize(vec3.cross(right, up));
  
        mat4.setAxis(transform, right, 0, transform)
        mat4.setAxis(transform, up, 1, transform)
        mat4.setAxis(transform, lookAt, 2, transform)

        mat4.scale(transform, vec3.create(1, vec3.length(particle.velocity), 1), transform)
      }      
      else if (this.props.renderer.mode.get() === RenderMode.HorizontalBillboard) {
        lookAt = vec3.create(0, 1, 0)
        const up = vec3.create(0, 0, -1);
        const right = vec3.create(1, 0, 0)

        mat4.setAxis(transform, right, 0, transform)
        mat4.setAxis(transform, up, 1, transform)
        mat4.setAxis(transform, lookAt, 2, transform)
      }

      mat4.multiply(particle.renderNode.transform, transform, particle.renderNode.transform);

      // Rotate using starting and liefeimte rotation.
      const rotate = particle.startRotation.slice();

      mat4.rotateX(particle.renderNode.transform, degToRad(rotate[0]), particle.renderNode.transform)
      mat4.rotateY(particle.renderNode.transform, degToRad(rotate[1]), particle.renderNode.transform)
      mat4.rotateZ(particle.renderNode.transform, degToRad(rotate[2]), particle.renderNode.transform)

      // Scale using starting and lifetime size.
      const scale = particle.startSize.slice();

      if (this.props.lifetimeSize.enabled.get()) {
        const lifetimeSize = this.props.lifetimeSize.size.getValue(lifetimeT);

        scale[0] *= lifetimeSize
        scale[1] *= lifetimeSize
        scale[2] *= lifetimeSize
      }

      mat4.scale(particle.renderNode.transform, scale, particle.renderNode.transform)
    }
    else if (particle.renderNode !== null) {
      particle.renderNode.detachSelf();
      particle.renderNode = null;
    }
  }

  private async emit(time: number, camera: Camera) {
    const millisecondsPerEmission = 1000 / this.props.rate.get();
    const maxParticles = this.props.maxPoints.get();

    while (this.nextEmitTime  <= time) {
      const startTime = this.nextEmitTime;

      if (this.particles.size < maxParticles) {
        const elapsedSinceStart = (startTime - this.startTime) / 1000.0;
        const durationRemainder = elapsedSinceStart % this.props.duration.get();
        const durationT = durationRemainder / this.props.duration.get();
  
        const lifetime = this.props.lifetime.getValue(durationT);
        const startSpeed = this.props.startSpeed.getValue(durationT);
        const startSize = this.props.startSize.getValue(durationT);
        const startRotation = this.props.startRotation.getValue(durationT)
        const startColor = vec4.create(...this.props.startColor.getColor(durationT));
        const [position, direction] = this.props.shape.getPositionAndDirection();

        const particle = new Particle(
          position,
          vec4.scale(direction, startSpeed),
          startTime,
          lifetime,
          startSize,
          startRotation,
          startColor,
        )

        if (this.props.space.get() === SpaceType.World) {
          // Transform the position to world psace.
          vec4.transformMat4(particle.position, this.renderNode!.transform, particle.position)
        }

        // Convert velocity to world space
        vec4.transformMat4(particle.velocity, this.renderNode!.transform, particle.velocity)  

        this.particles.set(particle.id, particle)

        // await this.renderParticle(particle, 0, camera);
        await this.updateParticle(particle, time, camera)
      }

      this.nextEmitTime += millisecondsPerEmission;
    }
  }

  removeParticles(): void {
    for (const [id, particle] of this.particles) {
      if (particle.renderNode) {
        particle.renderNode.detachSelf()
        particle.renderNode = null;
      }

      this.particles.delete(id)
    }
  }
}

export default ParticleSystem
