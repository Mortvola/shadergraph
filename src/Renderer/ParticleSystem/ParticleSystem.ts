import { vec3, vec4 } from "wgpu-matrix"
import {
  ParticleSystemInterface,
  ComponentType,
} from "../Types";
import { gravity, intersectionPlane } from "../Math";
import Particle from "./Particle";
import { ParticleSystemPropsInterface } from "./Types";
import SceneNode from "../Drawables/SceneNodes/SceneNode";
import Component from "../Drawables/Component";

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
    if (this.props.collision.enabled) {
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

            point.velocity = vec4.subtract(point.velocity, vec4.scale(planeNormal, dot + dot * this.props.collision.bounce))

            // Allow the collision to dampen the velocity
            point.velocity = vec4.scale(point.velocity, 1 - this.props.collision.dampen)  

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

  async update(time: number, elapsedTime: number): Promise<void> {
    if (this.startTime === 0) {
      this.startTime = time;
    }

    const elapsedTime2 = ((time - this.startTime) / 1000.0) % this.props.duration / this.props.duration;

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

  private async updateParticles(time: number, elapsedTime: number) {
    for (const [, particle] of this.particles) {
      const t = (time - particle.startTime) / (particle.lifetime * 1000);

      if (t > 1.0) {
        if (particle.sceneNode) {
          particle.sceneNode.detachSelf();
          particle.sceneNode = null;
        }
        
        this.particles.delete(particle.id)    
      }
      else {
        // Adjust velocity with gravity
        particle.velocity = vec4.addScaled(
          particle.velocity,
          [0, 1, 0, 0],
          this.props.gravityModifier.getValue(t) * gravity * elapsedTime,
        )

        if (this.props.lifetimeVelocity.enabled) {
          particle.velocity = vec4.scale(particle.velocity, this.props.lifetimeVelocity.speedModifier.getValue(t));
        }

        if (!this.collided(particle,  elapsedTime)) {
          // No collision occured
          // Find new position with current velocity
          particle.position = vec3.addScaled(
            particle.position,
            particle.velocity,
            elapsedTime,
          );
        }

        await this.renderParticle(particle, t);
      }
    }
  }

  async renderParticle(particle: Particle, t: number) {
    if (this.props.renderer.enabled && this.sceneNode) {
      if (particle.sceneNode === null) {
        particle.sceneNode = new SceneNode();
        this.sceneNode.addNode(particle.sceneNode)  
      }

      if (particle.drawable === null) {
        particle.drawable = await this.props.renderer.createDrawableComponent()
        particle.sceneNode.addComponent(particle.drawable);
      }

      particle.sceneNode.transformProps.translate = { value: particle.position };

      let size = particle.startSize;

      if (this.props.lifetimeSize.enabled) {
        size *= this.props.lifetimeSize.size.getValue(t);
      }

      particle.sceneNode.transformProps.scale = { value: vec3.create(size, size, size) }

      let lifetimeColor = [1, 1, 1, 1];

      if (this.props.lifetimeColor.enabled) {
        lifetimeColor = this.props.lifetimeColor.color.getColor(t);
      }

      particle.drawable.color[0] = lifetimeColor[0] * particle.startColor[0];
      particle.drawable.color[1] = lifetimeColor[1] * particle.startColor[1];
      particle.drawable.color[2] = lifetimeColor[2] * particle.startColor[2];
      particle.drawable.color[3] = lifetimeColor[3] * particle.startColor[3];    
    }
    else if (particle.sceneNode !== null) {
      particle.sceneNode.detachSelf();
      particle.sceneNode = null;
    }
  }

  private async emit(time: number, t: number) {
    if (this.particles.size < this.props.maxPoints) {
      const emitElapsedTime = time - this.lastEmitTime;

      let numToEmit = Math.min(Math.trunc((this.props.rate / 1000) * emitElapsedTime), this.props.maxPoints - this.particles.size);

      if (numToEmit > 0) {
        this.lastEmitTime = time;
      
        await this.emitSome(numToEmit, time, t)
      }
    }
  }

  async emitSome(numToEmit: number, startTime: number, t: number) {
    for (; numToEmit > 0; numToEmit -= 1) {
      const lifetime = this.props.lifetime.getValue(t);
      const startVelocity = this.props.startVelocity.getValue(t);
      const startSize = this.props.startSize.getValue(t);
      const startColor = this.props.startColor.getColor(t);
      const [position, direction] = this.props.shape.getPositionAndDirection();

      const particle = new Particle(
        position,
        vec4.scale(direction, startVelocity),
        startTime,
        lifetime,
        startSize,
        startColor,
      )

      this.particles.set(particle.id, particle)

      await this.renderParticle(particle, 0);
    }
  }

  removeParticles(): void {
    for (const [id, particle] of this.particles) {
      if (particle.sceneNode) {
        particle.sceneNode.detachSelf()
        particle.sceneNode = null;
      }

      this.particles.delete(id)
    }
  }
}

export default ParticleSystem
