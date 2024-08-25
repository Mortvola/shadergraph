import { makeObservable, observable, runInAction } from "mobx";
import { ShapeDescriptor, ShapeType } from "../Types";
import Cone from "./Cone";
import { vec4, Vec4 } from "wgpu-matrix";
import Sphere from "./Sphere";
import PSModule from "../PSModule";

class Shape extends PSModule {
  enabled = false;

  type = ShapeType.Cone;

  cone: Cone;

  sphere: Sphere;

  hemisphere: Sphere;

  constructor(onChange?: () => void) {
    super(onChange);
  
    this.cone = new Cone(onChange);

    this.sphere = new Sphere(false, onChange);

    this.hemisphere = new Sphere(true, onChange);

    makeObservable(this, {
      type: observable,
    })
  }

  static fromDescriptor(descriptor?: ShapeDescriptor, onChange?: () => void) {
    const shape = new Shape(onChange);

    if (descriptor) {
      shape.enabled = descriptor.enabled;
      shape.type = descriptor.type;
      shape.cone = Cone.fromDescriptor(descriptor.cone, onChange);
      shape.sphere = Sphere.fromDescriptor(descriptor.sphere, onChange);
      shape.hemisphere = Sphere.fromDescriptor({ ...descriptor.hemisphere, hemisphere: true }, onChange);
    }

    return shape;
  }

  toDescriptor(): ShapeDescriptor {
    return ({
      enabled: this.enabled,
      type: this.type,
      cone: this.cone.toDescriptor(),
      sphere: this.sphere.toDescriptor(),
      hemisphere: this.hemisphere.toDescriptor(),
    })
  }

  setType(type: ShapeType) {
    runInAction((() => {
      this.type = type;

      if (this.onChange) {
        this.onChange();
      }
    }))
  }

  getPositionAndDirection(): [Vec4, Vec4] {
    if (this.enabled) {
      switch (this.type) {
        case ShapeType.Sphere:
          return this.sphere.getPositionAndDirection();

        case ShapeType.Cone:
          return this.cone.getPositionAndDirection();

        case ShapeType.Hemisphere:
          return this.hemisphere.getPositionAndDirection();
      }
    }

    return [vec4.create(0, 0, 0, 1), vec4.create(0, 0, 0, 0)];
  }
}

export default Shape;
