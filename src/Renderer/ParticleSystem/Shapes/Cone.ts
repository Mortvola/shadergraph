import { makeObservable, observable, runInAction } from "mobx";
import { ConeDescriptor, ShapeType } from "../Types";
import { mat4, Vec4, vec4 } from "wgpu-matrix";
import { degToRad } from "../../Math";

class Cone {
  angle = 25;

  originRadius = 1;

  onChange?: () => void;

  constructor(onChange?: () => void) {
    this.onChange = onChange

    makeObservable(this, {
      angle: observable,
      originRadius: observable,
    })
  }

  static fromDescriptor(descriptor?: ConeDescriptor, onChange?: () => void) {
    const cone = new Cone(onChange);

    if (descriptor) {
      cone.angle = descriptor.angle;
      cone.originRadius = descriptor.originRadius;
    }

    return cone;
  } 

  toDescriptor(): ConeDescriptor {
    return {
      angle: this.angle,
      originRadius: this.originRadius,
    }
  }

  setAngle(angle: number) {
    runInAction(() => {
      this.angle = angle;

      if (this.onChange) {
        this.onChange();
      }
    })
  }

  setOriginRadius(radius: number) {
    runInAction(() => {
      this.originRadius = radius;

      if (this.onChange) {
        this.onChange()
      }
    })
  }

  getPositionAndDirection(): [Vec4, Vec4] {
    let origin = vec4.create(0, 0, 0, 1)

    // const offset = Math.random() * this.originRadius;
    const offset = this.originRadius;
    const rotate = degToRad(Math.random() * 360);

    let transform = mat4.identity()
    mat4.rotateY(transform, rotate, transform)
    mat4.translate(transform, vec4.create(0, 0, offset, 1), transform)
    vec4.transformMat4(origin, transform, origin)

    const p1 = vec4.create(0, 1, 0, 1);

    transform = mat4.identity()
    mat4.rotateY(transform, rotate, transform)
    mat4.translate(transform, vec4.create(0, 0, offset, 1), transform)
    mat4.rotateX(transform, degToRad(this.angle), transform)
    vec4.transformMat4(p1, transform, p1)

    const direction = vec4.subtract(p1, origin)

    return [origin, direction];
  }
}

export default Cone;