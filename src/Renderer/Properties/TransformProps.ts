import { vec3n } from 'wgpu-matrix';
import type { TransformPropsInterface } from '../Types';
import type { TransformPropsDescriptor } from '../../Scene/Types/Types';
import { removeUndefinedKeys } from './Types';
import PropsBase from './PropsBase';
import { PSVec3Type } from './Property';

class TransformProps extends PropsBase implements TransformPropsInterface {
  translate: PSVec3Type

  rotate: PSVec3Type;

  scale: PSVec3Type;

  onChange?: () => void;

  constructor(
    descriptor?: Partial<TransformPropsDescriptor>,
    onChange?: () => void,
  ) {
    super()

    this.onChange = onChange

    this.translate = new PSVec3Type(
      this,
      descriptor?.translate ? vec3n.create(...descriptor.translate) : undefined,
      vec3n.create(0, 0, 0),
      () => { this.handleChange() },
    )

    this.rotate = new PSVec3Type(
      this,
      descriptor?.rotate ? vec3n.create(...descriptor.rotate) : undefined,
      vec3n.create(0, 0, 0),
      () => { this.handleChange() },
    )

    this.scale = new PSVec3Type(
      this,
      descriptor?.scale ? vec3n.create(...descriptor.scale) : undefined,
      vec3n.create(1, 1, 1),
      () => { this.handleChange() },
    )
  }

  applyModifications(descriptor: TransformPropsDescriptor, override: boolean) {
    if (descriptor.translate) {
      this.translate.applyModifications(descriptor.translate, override)
    }

    if (descriptor.rotate) {
      this.rotate.applyModifications(descriptor.rotate, override)
    }

    if (descriptor.scale) {
      this.scale.applyModifications(descriptor.scale, override)
    }
  }

  toDescriptor(overridesOnly: boolean): TransformPropsDescriptor | undefined {
    const translateDescriptor = this.translate.toDescriptor(overridesOnly);
    const rotateDescriptor = this.rotate.toDescriptor(overridesOnly);
    const scaleDescriptor = this.scale.toDescriptor(overridesOnly);

    const descriptor = {
      translate: translateDescriptor ? [...translateDescriptor] : undefined,
      rotate: rotateDescriptor ? [...rotateDescriptor] : undefined,
      scale: scaleDescriptor ? [...scaleDescriptor] : undefined,
    }

    return removeUndefinedKeys(descriptor)
  }

  handleChange() {
    if (this.onChange) {
      this.onChange()
    }
  }
}

export default TransformProps;
