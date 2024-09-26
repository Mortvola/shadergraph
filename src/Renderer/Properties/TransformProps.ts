import { vec3 } from "wgpu-matrix";
import type { TransformPropsInterface } from "../Types";
import type { TransformPropsDescriptor } from "../../Scene/Types/Types";
import { PropsBase, removeUndefinedKeys } from "./Types";
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

    this.translate = new PSVec3Type('Translate', this, descriptor?.translate, vec3.create(0, 0, 0), onChange, previousProps?.translate)
    this.rotate = new PSVec3Type('Rotate', this, descriptor?.rotate, vec3.create(0, 0, 0), onChange, previousProps?.rotate)
    this.scale = new PSVec3Type('Scale', this, descriptor?.scale, vec3.create(1, 1, 1), onChange, previousProps?.scale)
  }

  toDescriptor(): TransformPropsDescriptor | undefined {
    const descriptor = {
      translate: this.translate.toDescriptor(),
      rotate: this.rotate.toDescriptor(),
      scale: this.scale.toDescriptor(),
    }

    return removeUndefinedKeys(descriptor)
  }
}

export default TransformProps;
