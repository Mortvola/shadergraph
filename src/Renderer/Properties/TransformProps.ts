import { vec3 } from "wgpu-matrix";
import { TransformPropsInterface } from "../Types";
import { TransformPropsDescriptor } from "../../State/types";
import { removeUndefinedKeys } from "./Types";
import { PSVec3Type } from "./Property2";

class TransformProps implements TransformPropsInterface {
  translate: PSVec3Type
  
  rotate: PSVec3Type;
  
  scale: PSVec3Type;

  constructor(descriptor?: Partial<TransformPropsDescriptor>, onChange?: () => void) {
    this.translate = new PSVec3Type(undefined, vec3.create(0, 0, 0), onChange)
    this.rotate = new PSVec3Type(undefined, vec3.create(0, 0, 0), onChange)
    this.scale = new PSVec3Type(undefined, vec3.create(1, 1, 1), onChange)

    if (descriptor) {
      this.translate.set(vec3.create(...(descriptor.translate ?? [0, 0, 0])))
      this.rotate.set(vec3.create(...(descriptor.rotate ?? [0, 0, 0])))
      this.scale.set(vec3.create(...(descriptor.scale ?? [1, 1, 1])))
    }
  }

  copyValues(other: TransformProps, noOverrides = true) {
    this.translate.copyProp(other.translate, noOverrides)
    this.rotate.copyProp(other.rotate, noOverrides)
    this.scale.copyProp(other.scale, noOverrides)
  }

  applyOverrides(overrides?: TransformPropsDescriptor) {
    if (overrides) {
      this.translate.set(overrides.translate, true)
      this.rotate.set(overrides.rotate, true)
      this.scale.set(overrides.scale, true)
    }
  }

  toDescriptor(overridesOnly = false): TransformPropsDescriptor | undefined {
    const descriptor = {
      translate: this.translate.toDescriptor(overridesOnly),
      rotate: this.rotate.toDescriptor(overridesOnly),
      scale: this.scale.toDescriptor(overridesOnly),
    }

    return removeUndefinedKeys(descriptor)
  }
}

export default TransformProps;
