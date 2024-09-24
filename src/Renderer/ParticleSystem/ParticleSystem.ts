import { vec3, vec4 } from "wgpu-matrix"
import type {
  ParticleSystemInterface} from "../Types";
import {
  ComponentType,
} from "../Types";
import { gravity, intersectionPlane } from "../Math";
import Particle from "./Particle";
import RenderNode from "../Drawables/SceneNodes/RenderNode";
import Component from "../Drawables/Component";
import type { ParticleSystemPropsInterface } from "./ParticleSystemPropsInterface";
import { SpaceType } from "./Types";

class ParticleSystem extends Component implements ParticleSystemInterface {
  props: ParticleSystemPropsInterface

  particles: Map<number, Particle> = new Map();

  startTime = 0;

  lastEmitTime = 0;

  constructor(props: ParticleSystemPropsInterface) {
    super(ComponentType.ParticleSystem)
  
    this.props = props;
  }

  reset() {
    this.startTime = 0;
    this.lastEmitTime = 0
    this.particles.clear()
  }

  collided(point: Particle, elapsedTime: number): boolean {
    if (this.props.collision.enabled.get()) {
      const planeNormal = vec4.create(0, 1, 0, 0);
      const planeOrigin = vec4.create(0, 0, 0, 1);

      const sphereRadius = point.startSize / 2;

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

  async update(time: number, elapsedTime: number): Promise<void> {
    if (this.renderNode) {
      if (this.startTime === 0) {
        this.startTime = time;
      }

      const elapsedTime2 = ((time - this.startTime) / 1000.0) % this.props.duration.get() / this.props.duration.get();

      if (this.lastEmitTime === 0) {
        this.lastEmitTime = time;

        await this.emitSome(1, time, elapsedTime2)
      }
      else {
        // Update existing particles
        await this.updateParticles(time, elapsedTime);
      
        // Add new particles
        await this.emit(time, elapsedTime2)
      }
    }
  }

  private async updateParticles(time: number, elapsedTime: number) {
    for (const [, particle] of this.particles) {
      const t = (time - particle.startTime) / (particle.lifetime * 1000);

      if (t > 1.0) {
        // Particle's lifetime has expired. Remove the scene node from the graph
        // and delete the particle.
        if (particle.renderNode) {
          particle.renderNode.detachSelf();
          particle.renderNode = null;
        }
        
        this.particles.delete(particle.id)    
      }
      else {
        const gravityVector = vec4.create(0, 1, 0, 0)

        if (!this.renderNode) {
          throw new Error('renderNode is not set')
        }

        // Transform the position into world space to allow for gravity effect
        // and collision detection.
        // Note that velocity is already in world space
        vec4.transformMat4(particle.position, particle.parentRenderNode!.transform, particle.position)

        // Adjust velocity with gravity
        vec4.addScaled(
          particle.velocity,
          gravityVector,
          this.props.gravityModifier.getValue(t) * gravity * elapsedTime,
          particle.velocity,
        )

        if (this.props.lifetimeVelocity.enabled.get()) {
          particle.velocity = vec4.scale(particle.velocity, this.props.lifetimeVelocity.speedModifier.getValue(t));
        }

        if (!this.collided(particle,  elapsedTime)) {
          // No collision occured
          // Find new position with current velocity
          vec4.addScaled(
            particle.position,
            particle.velocity,
            elapsedTime,
            particle.position,
          );
        }

        // Transform position back into local space.
        vec4.transformMat4(particle.position, particle.parentRenderNode!.inverseTransform, particle.position)

        await this.renderParticle(particle, t);
      }
    }
  }

  async renderParticle(particle: Particle, t: number) {
    if (this.props.renderer.enabled.get() && this.renderNode) {
      if (particle.renderNode === null) {
        particle.renderNode = new RenderNode();
        particle.parentRenderNode?.addNode(particle.renderNode);
      }

      if (particle.drawable === null) {
        particle.drawable = await this.props.renderer.createDrawableComponent()
        particle.renderNode.addComponent(particle.drawable);
      }

      vec3.copy(particle.position, particle.renderNode.translate);

      let size = particle.startSize;

      if (this.props.lifetimeSize.enabled.get()) {
        size *= this.props.lifetimeSize.size.getValue(t);
      }

      vec3.set(size, size, size, particle.renderNode.scale)

      let lifetimeColor = [1, 1, 1, 1];

      if (this.props.lifetimeColor.enabled.get()) {
        lifetimeColor = this.props.lifetimeColor.color.getColor(t);
      }

      particle.drawable.color[0] = lifetimeColor[0] * particle.startColor[0];
      particle.drawable.color[1] = lifetimeColor[1] * particle.startColor[1];
      particle.drawable.color[2] = lifetimeColor[2] * particle.startColor[2];
      particle.drawable.color[3] = lifetimeColor[3] * particle.startColor[3];    
    }
    else if (particle.renderNode !== null) {
      particle.renderNode.detachSelf();
      particle.renderNode = null;
    }
  }

  private async emit(time: number, t: number) {
    if (this.particles.size < this.props.maxPoints.get()) {
      const emitElapsedTime = time - this.lastEmitTime;

      const numToEmit = Math.min(Math.trunc((this.props.rate.get() / 1000) * emitElapsedTime), this.props.maxPoints.get() - this.particles.size);

      if (numToEmit > 0) {
        this.lastEmitTime = time;
      
        await this.emitSome(numToEmit, time, t)
      }
    }
  }

  async emitSome(numToEmit: number, startTime: number, t: number) {
    for (; numToEmit > 0; numToEmit -= 1) {
      const lifetime = this.props.lifetime.getValue(t);
      const startSpeed = this.props.startSpeed.getValue(t);
      const startSize = this.props.startSize.getValue(t);
      const startColor = this.props.startColor.getColor(t);
      const [position, direction] = this.props.shape.getPositionAndDirection();

      const particle = new Particle(
        position,
        vec4.scale(direction, startSpeed),
        startTime,
        lifetime,
        startSize,
        startColor,
      )

      if (this.props.space.get() === SpaceType.World) {
        particle.parentRenderNode = this.renderNode!.sceneGraph!.rootRenderNode

        // Compute position to world psace.
        vec4.transformMat4(particle.position, this.renderNode!.transform, particle.position)
      }
      else {
        particle.parentRenderNode = this.renderNode
      }

      // Convert velocity to world space
      vec4.transformMat4(particle.velocity, this.renderNode!.transform, particle.velocity)  

      this.particles.set(particle.id, particle)

      await this.renderParticle(particle, 0);
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
