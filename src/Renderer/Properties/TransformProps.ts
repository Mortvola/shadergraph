import { vec3n } from "wgpu-matrix";
import type { TransformPropsInterface } from "../Types";
import type { TransformPropsDescriptor } from "../../Scene/Types/Types";
import { removeUndefinedKeys } from "./Types";
import PropsBase from "./PropsBase";
import { PSVec3Type } from "./Property";

class TransformProps extends PropsBase implements TransformPropsInterface {
  translate: PSVec3Type
  
  rotate: PSVec3Type;
  
  scale: PSVec3Type;

  constructor(
    descriptor?: Partial<TransformPropsDescriptor>,
    onChange?: () => void,
    previousProps?: TransformProps,
  ) {
    super()

    this.translate = new PSVec3Type('Translate', this, descriptor?.translate ? vec3n.create(...descriptor.translate) : undefined, vec3n.create(0, 0, 0), onChange, previousProps?.translate)
    this.rotate = new PSVec3Type('Rotate', this, descriptor?.rotate ? vec3n.create(...descriptor.rotate) : undefined, vec3n.create(0, 0, 0), onChange, previousProps?.rotate)
    this.scale = new PSVec3Type('Scale', this, descriptor?.scale ? vec3n.create(...descriptor.scale) : undefined, vec3n.create(1, 1, 1), onChange, previousProps?.scale)
  }

  toDescriptor(): TransformPropsDescriptor | undefined {
    const translateDescriptor = this.translate.toDescriptor();
    const rotateDescriptor = this.rotate.toDescriptor();
    const scaleDescriptor = this.scale.toDescriptor();

    const descriptor = {
      translate: translateDescriptor ? [...translateDescriptor] : undefined,
      rotate: rotateDescriptor ? [...rotateDescriptor] : undefined,
      scale: scaleDescriptor ? [...scaleDescriptor] : undefined,
    }

    return removeUndefinedKeys(descriptor)
  }
}

export default TransformProps;
