import { vec3 } from "wgpu-matrix";
import { TransformPropsInterface } from "./types";
import { makeObservable, observable, runInAction } from "mobx";
import { TransformPropsDescriptor } from "../State/types";

class TransformProps implements TransformPropsInterface {
  translate = vec3.create(0, 0, 0);
  
  rotate = vec3.create(0, 0, 0);
  
  scale = vec3.create(1, 1, 1);

  constructor(descriptor?: TransformPropsDescriptor) {
    if (descriptor) {
      this.translate = vec3.create(...descriptor.translate)
      this.rotate = vec3.create(...descriptor.rotate)
      this.scale = vec3.create(...descriptor.scale)
    }
    makeObservable(this, {
      translate: observable,
      rotate: observable,
      scale: observable,
    })
  }

  setTranslate(translate: number[]) {
    runInAction(() => {
      this.translate[0] = translate[0];
      this.translate[1] = translate[1];
      this.translate[2] = translate[2];

      if (this.onChange) {
        this.onChange()
      }
    })
  }

  onChange?: () => void;

  toDescriptor(): TransformPropsDescriptor {
    return ({
      translate: [...this.translate],
      rotate: [...this.rotate],
      scale: [...this.scale],
    })
  }
}

export default TransformProps;
