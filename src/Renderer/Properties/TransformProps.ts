import { Vec3, vec3 } from "wgpu-matrix";
import { TransformPropsInterface } from "../Types";
import { observable } from "mobx";
import { TransformPropsDescriptor } from "../../State/types";
import { PropertyType, PSVec3Type, removeUndefinedKeys } from "./Types";

class TransformProps implements TransformPropsInterface {
  @observable
  accessor _translate: PSVec3Type

  get translate(): Vec3 {
    return this._translate.value
  }

  set translate(value: PropertyType<Vec3>) {
    this._translate.value = value;
  }
  
  @observable
  accessor _rotate: PSVec3Type;

  get rotate(): Vec3 {
    return this._rotate.value
  }

  set rotate(value: PropertyType<Vec3>) {
    this._rotate.value = value;
  }
  
  @observable
  accessor _scale: PSVec3Type;

  get scale(): Vec3 {
    return this._scale.value;
  }

  set scale(value: PropertyType<Vec3>) {
    this._scale.value = value;
  }

  constructor(descriptor?: Partial<TransformPropsDescriptor>, onChange?: () => void) {
    this._translate = new PSVec3Type(vec3.create(0, 0, 0), onChange)
    this._rotate = new PSVec3Type(vec3.create(0, 0, 0), onChange)
    this._scale = new PSVec3Type(vec3.create(1, 1, 1), onChange)

    if (descriptor) {
      this.translate = { value: vec3.create(...(descriptor.translate ?? [0, 0, 0])) }
      this.rotate = { value: vec3.create(...(descriptor.rotate ?? [0, 0, 0])) }
      this.scale = { value: vec3.create(...(descriptor.scale ?? [1, 1, 1])) }
    }
  }

  copyValues(other: TransformProps, noOverrides = true) {
    this._translate.copyValues(other._translate, noOverrides)
    this._rotate.copyValues(other._rotate, noOverrides)
    this._scale.copyValues(other._scale, noOverrides)
  }

  applyOverrides(overrides?: TransformPropsDescriptor) {
    if (overrides) {
      this._translate.applyOverride(overrides.translate)
      this._rotate.applyOverride(overrides.rotate)
      this._scale.applyOverride(overrides.scale)
    }
  }

  toDescriptor(overridesOnly = false): TransformPropsDescriptor | undefined {
    const descriptor = {
      translate: this._translate.toDescriptor(overridesOnly),
      rotate: this._rotate.toDescriptor(overridesOnly),
      scale: this._scale.toDescriptor(overridesOnly),
    }

    return removeUndefinedKeys(descriptor)
  }
}

export default TransformProps;
