import { makeObservable, observable } from "mobx";
import { ConeDescriptor } from "../Types";
import { mat4, Vec4, vec4 } from "wgpu-matrix";
import { degToRad } from "../../Math";
import { PSNumber, removeUndefinedKeys } from "../../Properties/Types";

class Cone {
  _angle: PSNumber;

  get angle(): number {
    return this._angle.value
  }

  set angle(newValue: number) {
    this._angle.value = newValue;
  }

  _originRadius: PSNumber;

  get originRadius(): number {
    return this._originRadius.value
  }

  set originRadius(newValue: number) {
    this._originRadius.value = newValue;
  }

  constructor(onChange?: () => void) {
    this._angle = new PSNumber(25, onChange);
    this._originRadius = new PSNumber(1, onChange);

    makeObservable(this, {
      _angle: observable,
      _originRadius: observable,
    })
  }

  copyValues(other: Cone, noOverrides = true) {
    this._angle.copyValues(other._angle, noOverrides);
    this._originRadius.copyValues(other._originRadius, noOverrides);
  }

  hasOverrides() {
    return (
      this._angle.override
      || this._originRadius.override
    )
  }

  static fromDescriptor(descriptor?: ConeDescriptor, onChange?: () => void) {
    const cone = new Cone(onChange);

    if (descriptor) {
      cone.angle = descriptor.angle ?? 25;
      cone.originRadius = descriptor.originRadius ?? 1;
    }

    return cone;
  } 

  toDescriptor(overridesOnly  = false): ConeDescriptor | undefined {
    const descriptor = {
      angle: this._angle.toDescriptor(overridesOnly),
      originRadius: this._originRadius.toDescriptor(overridesOnly),
    }

    return removeUndefinedKeys(descriptor)
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
