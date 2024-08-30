import { Vec3, vec3 } from "wgpu-matrix";
import { TransformPropsInterface } from "../Types";
import { makeObservable, observable } from "mobx";
import { TransformPropsDescriptor } from "../../State/types";
import { PSVec3Type } from "./Types";

class TransformProps implements TransformPropsInterface {
  _translate: PSVec3Type

  get translate(): Vec3 {
    return this._translate.value
  }

  set translate(newValue: Vec3) {
    this._translate.value = newValue;
  }
  
  _rotate: PSVec3Type;

  get rotate(): Vec3 {
    return this._rotate.value
  }

  set rotate(newValue: Vec3) {
    this._rotate.value = newValue;
  }
  
  _scale: PSVec3Type;

  get scale(): Vec3 {
    return this._scale.value;
  }

  set scale(newValue: Vec3) {
    this._scale.value = newValue;
  }

  constructor(descriptor?: Partial<TransformPropsDescriptor>, onChange?: () => void) {
    this._translate = new PSVec3Type(vec3.create(0, 0, 0), onChange)
    this._rotate = new PSVec3Type(vec3.create(0, 0, 0), onChange)
    this._scale = new PSVec3Type(vec3.create(1, 1, 1), onChange)

    if (descriptor) {
      this.translate = vec3.create(...(descriptor.translate ?? [0, 0, 0]))
      this.rotate = vec3.create(...(descriptor.rotate ?? [0, 0, 0]))
      this.scale = vec3.create(...(descriptor.scale ?? [1, 1, 1]))
    }

    makeObservable(this, {
      _translate: observable,
      _rotate: observable,
      _scale: observable,
    })
  }

  toDescriptor(): TransformPropsDescriptor {
    return ({
      translate: [...this.translate],
      rotate: [...this.rotate],
      scale: [...this.scale],
    })
  }
}

export default TransformProps;
