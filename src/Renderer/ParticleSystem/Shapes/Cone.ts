import { makeObservable, observable } from "mobx";
import { ConeDescriptor } from "../Types";
import { mat4, Vec4, vec4 } from "wgpu-matrix";
import { degToRad } from "../../Math";
import { removeUndefinedKeys } from "../../Properties/Types";
import { PSNumber } from "../../Properties/Property2";

class Cone {
  angle: PSNumber;

  originRadius: PSNumber;

  constructor(onChange?: () => void) {
    this.angle = new PSNumber(25, onChange);
    this.originRadius = new PSNumber(1, onChange);
  }

  copyValues(other: Cone, noOverrides = true) {
    this.angle.copyValues(other.angle, noOverrides);
    this.originRadius.copyValues(other.originRadius, noOverrides);
  }

  hasOverrides() {
    return (
      this.angle.override
      || this.originRadius.override
    )
  }

  static fromDescriptor(descriptor?: ConeDescriptor, onChange?: () => void) {
    const cone = new Cone(onChange);

    if (descriptor) {
      cone.angle.set(descriptor.angle ?? 25);
      cone.originRadius.set(descriptor.originRadius ?? 1);
    }

    return cone;
  }

  applyOverrides(descriptor?: ConeDescriptor) {
    this.angle.set(descriptor?.angle, true)
    this.originRadius.set(descriptor?.originRadius, true)
  }

  toDescriptor(overridesOnly  = false): ConeDescriptor | undefined {
    const descriptor = {
      angle: this.angle.toDescriptor(overridesOnly),
      originRadius: this.originRadius.toDescriptor(overridesOnly),
    }

    return removeUndefinedKeys(descriptor)
  }

  getPositionAndDirection(): [Vec4, Vec4] {
    let origin = vec4.create(0, 0, 0, 1)

    // const offset = Math.random() * this.originRadius;
    const offset = this.originRadius.get();
    const rotate = degToRad(Math.random() * 360);

    let transform = mat4.identity()
    mat4.rotateY(transform, rotate, transform)
    mat4.translate(transform, vec4.create(0, 0, offset, 1), transform)
    vec4.transformMat4(origin, transform, origin)

    const p1 = vec4.create(0, 1, 0, 1);

    transform = mat4.identity()
    mat4.rotateY(transform, rotate, transform)
    mat4.translate(transform, vec4.create(0, 0, offset, 1), transform)
    mat4.rotateX(transform, degToRad(this.angle.get()), transform)
    vec4.transformMat4(p1, transform, p1)

    const direction = vec4.subtract(p1, origin)

    return [origin, direction];
  }
}

export default Cone;
