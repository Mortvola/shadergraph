import { Vec4, mat4, vec3, vec4 } from "wgpu-matrix"
import { ContainerNodeInterface, isPSValue, ParticleDescriptor, ParticleSystemInterface, PSValue, PSValueType } from "./types";
import DrawableNode from "./Drawables/SceneNodes/DrawableNode";
import { degToRad } from "./Math";
import DrawableInterface from "./Drawables/DrawableInterface";
import Billboard from "./Drawables/Billboard";
import { MaterialDescriptor } from "./Materials/MaterialDescriptor";
import { makeObservable, observable } from "mobx";

type Point = {
  startVelocity: number,
  direction: Vec4,
  startTime: number,
  lifetime: number,
  drawable: DrawableNode,
  startSize: number,
  color: Vec4,
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

  size: PSValue;

  originRadius: number;

  startColor: number[][];

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

    this.startColor = (descriptor?.startColor ?? descriptor?.initialColor) ?? [[1, 1, 1, 1], [1, 1, 1, 1]]
    this.materialId = descriptor?.materialId
    this.materialDescriptor = descriptor?.materialId

    makeObservable(this, {
      lifetime: observable,
      startVelocity: observable,
      startSize: observable,
      size: observable,
      startColor: observable,
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
    await this.emit(time, elapsedTime, elapsedTime2, scene)
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

      point.drawable.translate = vec3.addScaled(point.drawable.translate, point.direction, point.startVelocity * elapsedTime);

      const size = getPSValue(this.size, t) * point.startSize;

      point.drawable.scale = vec3.create(size, size, size)

      point.drawable.color[0] = point.color[0];
      point.drawable.color[1] = point.color[1];
      point.drawable.color[2] = point.color[2];
      point.drawable.color[3] = point.color[3];
    }
  }

  private async emit(time: number, elapsedTime: number, t: number, scene: ContainerNodeInterface) {
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
    let lifetime = getPSValue(this.lifetime, t);
    let startVelocity = getPSValue(this.startVelocity, t);
    let startSize = getPSValue(this.startSize, t);

    for (; numToEmit > 0; numToEmit -= 1) {
      const drawable = await DrawableNode.create(this.drawable!, this.materialDescriptor);

      let origin = vec4.create(0, 0, 0, 1)

      // const offset = Math.random() * this.originRadius;
      const offset = this.originRadius;
      const rotate = degToRad(Math.random() * 360);

      let transform = mat4.identity()
      mat4.rotateY(transform, rotate, transform)
      mat4.translate(transform, vec4.create(0, 0, offset, 1), transform)
      vec4.transformMat4(origin, transform, origin)

      drawable.translate = origin
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

      const vector = vec4.subtract(p1, origin)

      const computeRandomColor = (color1: number[], color2: number[]) => {
        return [
          Math.random() * (color2[0] - color1[0]) + color1[0],
          Math.random() * (color2[1] - color1[1]) + color1[1],
          Math.random() * (color2[2] - color1[2]) + color1[2],
          1,
        ]
      }

      const point: Point = {
        startVelocity,
        direction: vector,
        startTime,
        lifetime,
        startSize,
        drawable,
        color: computeRandomColor(this.startColor[0], this.startColor[1]),
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
      materialId: this.materialId,
    })
  }
}

export default ParticleSystem
