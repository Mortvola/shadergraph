import { Vec4, mat4, vec3, vec4 } from "wgpu-matrix"
import { ContainerNodeInterface, Gradient, isPSColor, isPSValue, LifetimeColor, ParticleDescriptor, ParticleSystemInterface, PSColor, PSColorType, PSValue, PSValueType } from "./types";
import DrawableNode from "./Drawables/SceneNodes/DrawableNode";
import { degToRad, gravity, intersectionPlane, lerp } from "./Math";
import DrawableInterface from "./Drawables/DrawableInterface";
import Billboard from "./Drawables/Billboard";
import { MaterialDescriptor } from "./Materials/MaterialDescriptor";
import { makeObservable, observable } from "mobx";

export function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T
}

type Point = {
  velocity: Vec4,
  startTime: number,
  lifetime: number,
  drawable: DrawableNode,
  size: number,
  startColor: Vec4,
}

const getPSValue = (value: PSValue, t: number) => {
  switch (value.type) {
    case PSValueType.Constant:
      return value.value[0];

    case PSValueType.Random:
      return (value.value[1] - value.value[0]) * Math.random() + value.value[0];

    case PSValueType.Curve: {
      const delta = value.curve[0].points[1][1] - value.curve[0].points[0][1];
      return value.curve[0].points[0][1] + delta * t;
    }
  }

  return 1;
}

const getColorFromGradient = (gradient: Gradient, t: number) => {
  let a = 1;
  let c = [1, 1, 1];

  // Find first key that is greater than or equal to t.
  let index = gradient.alphaKeys.findIndex((k) => k.position >= t);

  if (index !== -1) {
    if (index > 0) {
      const k1 = gradient.alphaKeys[index - 1];
      const k2 = gradient.alphaKeys[index];
      const pct = (t - k1.position) / (k2.position - k1.position)

      a = lerp(k1.value, k2.value, pct)
    }
    else {
      a = gradient.alphaKeys[0].value;
    }
  }

  // Find first key that is greater than or equal to t.
  index = gradient.colorKeys.findIndex((k) => k.position >= t);

  if (index !== -1) {
    if (index > 0) {
      const k1 = gradient.colorKeys[index - 1];
      const k2 = gradient.colorKeys[index];
      const pct = (t - k1.position) / (k2.position - k1.position)

      c = lerp(k1.value.slice(0, 3), k2.value.slice(0, 3), pct);
    }
    else {
      c = gradient.colorKeys[0].value.slice(0, 3);
    }
  }

  return [...c, a];
}

const getPSColor = (color: PSColor, t: number): number[] => {
  switch (color.type) {
    case PSColorType.Constant:
      return color.color[0];
    
    case PSColorType.Random: {
      const r = Math.random();

      return lerp(color.color[0], color.color[1], r)
    }

    case PSColorType.Gradient:
      return getColorFromGradient(color.gradients[0], t);

    case PSColorType.RandomeGradient:
      const color1 = getColorFromGradient(color.gradients[0], t);
      const color2 = getColorFromGradient(color.gradients[1], t);

      const r = Math.random();

      return lerp(color1, color2, r)
  }

  return [1, 1, 1, 1];
}

class ParticleSystem implements ParticleSystemInterface {
  id: number

  points: Point[] = []

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

  size: PSValue; // Size over lifetime

  originRadius: number;

  gravityModifier: number;

  collisionEnabled: boolean;

  bounce: number;

  dampen: number;

  materialId: number | undefined = undefined;

  materialDescriptor: MaterialDescriptor | number | undefined;

  drawable: DrawableInterface | null = null;

  private constructor(id: number, descriptor?: ParticleDescriptor) {
    this.id = id

    this.duration = descriptor?.duration ?? 5
    this.rate = descriptor?.rate ?? 10
    this.maxPoints = descriptor?.maxPoints ?? 50

    if (descriptor?.lifetime && isPSValue(descriptor?.lifetime)) {
      this.lifetime = descriptor.lifetime
    }
    else {
      this.lifetime = {
        type: descriptor?.lifetimeType ?? PSValueType.Random,
        value: [
          descriptor?.lifetime
            ? (descriptor.lifetime  as [number, number])[0]
            : 1,
          descriptor?.lifetime
            ? (descriptor.lifetime as [number, number])[1]
            : 5
        ],
        curve: [
          { points: [[0, 1], [1, 5]] },
          { points: [[0, 1], [1, 5]] },
        ]
      }  
    }

    this.angle = descriptor?.angle ?? 25
    this.originRadius = descriptor?.originRadius ?? 1

    this.startVelocity = descriptor?.startVelocity
      ?? ({
        type: PSValueType.Constant,
        value: [1, 1],
        curve: [
          { points: [[0, 1], [1, 1]]},
          { points: [[0, 1], [1, 1]]},
        ]
      })
    
    this.startSize = descriptor?.startSize
      ?? ({
        type: PSValueType.Constant,
        value: [1, 1],
        curve: [
          { points: [[0, 1], [1, 1]]},
          { points: [[0, 1], [1, 1]]},
        ]
      })
    
    if (descriptor?.size && isPSValue(descriptor?.size)) {
      this.size = descriptor.size;
    }
    else {
      this.size = {
        type: descriptor?.sizeType ?? PSValueType.Random,
        value: [descriptor?.initialSize ?? 1, descriptor?.finalSize ?? (descriptor?.initialSize ?? 1) ],
        curve: [
          { points: [[0, 1], [1, 1]] },
          { points: [[0, 1], [1, 1]] },
        ]
      }  
    }

    const defaultGradient: Gradient = {
      alphaKeys: [
        {
          id: 0,
          position: 0,
          value: 1,
        },
        {
          id: 1,
          position: 1,
          value: 1,
        }
      ],
      colorKeys: [
        {
          id: 0,
          position: 0,
          value: [1, 1, 1, 1],
        },
        {
          id: 1,
          position: 1,
          value: [1, 1, 1, 1],
        }
      ],
    };

    if (descriptor?.startColor && isPSColor(descriptor?.startColor)) {
      this.startColor = descriptor.startColor;

      if (this.startColor.gradients === undefined) {
        if (this.startColor.gradient === undefined) {
          this.startColor.gradients = [clone(defaultGradient), clone(defaultGradient)]
        }
        else {
          this.startColor.gradients = [this.startColor.gradient, clone(defaultGradient)];
          this.startColor.gradient = undefined
        }
      }
    }
    else if (descriptor?.startColor && Array.isArray(descriptor?.startColor)) {
      this.startColor = {
        type: PSColorType.Random,
        color: [
          descriptor.startColor[0],
          descriptor.startColor[1],
        ],
        gradients: [clone(defaultGradient), clone(defaultGradient)],
      }
    }
    else if (descriptor?.initialColor) {
      this.startColor = {
        type: PSColorType.Random,
        color: [
          descriptor.initialColor[0],
          descriptor.initialColor[1],
        ],
        gradients: [clone(defaultGradient), clone(defaultGradient)],
      }
    }
    else {
      this.startColor = {
        type: PSColorType.Constant,
        color: [
          [1, 1, 1, 1],
          [1, 1, 1, 1],
        ],
        gradients: [clone(defaultGradient), clone(defaultGradient)],
      }
    }

    this.lifetimeColor = descriptor?.lifetimeColor ?? {
      enabled: false,
      color: {
        type: PSColorType.Gradient,
        color: [[1, 1, 1, 1], [1, 1, 1, 1]],
        gradients: [clone(defaultGradient), clone(defaultGradient)],
      }
    }

    this.gravityModifier = descriptor?.gravityModifier ?? 0;

    this.collisionEnabled = descriptor?.collisionEnabled ?? false;
    this.bounce = descriptor?.bounce ?? 1;
    this.dampen = descriptor?.dampen ?? 0;

    this.materialId = descriptor?.materialId
    this.materialDescriptor = descriptor?.materialId

    makeObservable(this, {
      lifetime: observable,
      startVelocity: observable,
      startSize: observable,
      size: observable,
      startColor: observable,
      gravityModifier: observable,
      collisionEnabled: observable,
    })

    makeObservable(this.lifetimeColor, {
      enabled: observable,
    })

    makeObservable(this.lifetimeColor.color, {
      gradients: observable,
    })
  }

  static async create(id: number, descriptor?: ParticleDescriptor) {
    return new ParticleSystem(id, descriptor)
  }

  reset() {
    this.startTime = 0;
    this.lastEmitTime = 0
    this.points = []
  }

  collided(point: Point, elapsedTime: number, scene: ContainerNodeInterface): boolean {
    if (this.collisionEnabled) {
      const planeNormal = vec4.create(0, 1, 0, 0);
      const planeOrigin = vec4.create(0, 0, 0, 1);

      const sphereRadius = point.size / 2;

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
                point.size / 2,
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
    for (let i = 0; i < this.points.length; i +=1) {
      const point = this.points[i];

      const t = (time - point.startTime) / (point.lifetime * 1000);

      if (t > 1.0) {
        scene.removeNode(point.drawable);
        
        this.points = [
          ...this.points.slice(0, i),
          ...this.points.slice(i + 1),
        ]

        i -= 1

        continue
      }

      // Adjust velocity with gravity
      point.velocity = vec4.addScaled(
        point.velocity,
        [0, 1, 0, 0],
        this.gravityModifier * gravity * elapsedTime,
      )

      if (!this.collided(point,  elapsedTime, scene)) {
        // Find new position with current velocity
        point.drawable.translate = vec3.addScaled(
          point.drawable.translate,
          point.velocity,
          elapsedTime,
        );
      }

      const size = getPSValue(this.size, t) * point.size;

      point.drawable.scale = vec3.create(size, size, size)

      let lifetimeColor = [1, 1, 1, 1];

      if (this.lifetimeColor.enabled) {
        lifetimeColor = getPSColor(this.lifetimeColor.color, t);
      }

      point.drawable.color[0] = lifetimeColor[0] * point.startColor[0];
      point.drawable.color[1] = lifetimeColor[1] * point.startColor[1];
      point.drawable.color[2] = lifetimeColor[2] * point.startColor[2];
      point.drawable.color[3] = lifetimeColor[3] * point.startColor[3];
    }
  }

  private async emit(time: number, t: number, scene: ContainerNodeInterface) {
    if (this.points.length < this.maxPoints) {
      const emitElapsedTime = time - this.lastEmitTime;

      let numToEmit = Math.min(Math.trunc((this.rate / 1000) * emitElapsedTime), this.maxPoints - this.points.length);

      if (numToEmit > 0) {
        this.lastEmitTime = time;
      
        // while (this.points.length < this.maxPoints) {
        await this.emitSome(numToEmit, time, t, scene)
      }
    }
  }

  async emitSome(numToEmit: number, startTime: number, t: number, scene: ContainerNodeInterface) {
    for (; numToEmit > 0; numToEmit -= 1) {
      const lifetime = getPSValue(this.lifetime, t);
      const startVelocity = getPSValue(this.startVelocity, t);
      const size = getPSValue(this.startSize, t);
      const startColor = getPSColor(this.startColor, t);

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

      drawable.scale = vec3.create(this.size.value[0], this.size.value[0], this.size.value[0]);

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

      const point: Point = {
        velocity: vec4.scale(direction, startVelocity),
        startTime,
        lifetime,
        size,
        drawable,
        startColor,
      }

      this.points.push(point)
    }
  }

  removePoints(scene: ContainerNodeInterface): void {
    for (const point of this.points) {
      scene.removeNode(point.drawable)
    }
  }

  getDescriptor(): ParticleDescriptor {
    return ({
      duration: this.duration,
      maxPoints: this.maxPoints,
      rate: this.rate,
      angle: this.angle,
      originRadius: this.originRadius,
      lifetime: this.lifetime,
      startVelocity: this.startVelocity,
      startSize: this.startSize,
      size: this.size,
      startColor: this.startColor,
      lifetimeColor: this.lifetimeColor,
      gravityModifier: this.gravityModifier,
      collisionEnabled: this.collisionEnabled,
      bounce: this.bounce,
      dampen: this.dampen,
      materialId: this.materialId,
    })
  }
}

export default ParticleSystem
