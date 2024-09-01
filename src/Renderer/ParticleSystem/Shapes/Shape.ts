import { makeObservable, observable } from "mobx";
import { ShapeDescriptor, ShapeType } from "../Types";
import Cone from "./Cone";
import { vec4, Vec4 } from "wgpu-matrix";
import Sphere from "./Sphere";
import PSModule from "../PSModule";
import { PSShapeType, removeUndefinedKeys } from "../../Properties/Types";

class Shape extends PSModule {
  _type: PSShapeType;

  get type(): ShapeType {
    return this._type.value
  }

  set type(value: ShapeType) {
    this._type.value = { value };
  }

  cone: Cone;

  sphere: Sphere;

  hemisphere: Sphere;

  constructor(onChange?: () => void) {
    super(onChange);
  
    this._type = new PSShapeType(ShapeType.Cone, onChange)
    this.cone = new Cone(onChange);
    this.sphere = new Sphere(false, onChange);
    this.hemisphere = new Sphere(true, onChange);

    makeObservable(this, {
      _type: observable,
    })
  }

  copyValues(other: Shape, noOverrides = true) {
    super.copyValues(other, noOverrides);
    this._type.copyValues(other._type, noOverrides);
    this.cone.copyValues(other.cone, noOverrides);
    this.sphere.copyValues(other.sphere, noOverrides);
    this.hemisphere.copyValues(other.hemisphere, noOverrides);
  }

  hasOverrides() {
    return (
      this._type.override
      || this.cone.hasOverrides()
      || this.sphere.hasOverrides()
      || this.hemisphere.hasOverrides()
    )
  }

  static fromDescriptor(descriptor?: ShapeDescriptor, onChange?: () => void) {
    const shape = new Shape(onChange);

    if (descriptor) {
      shape.enabled = descriptor.enabled ?? false;
      shape.type = descriptor.type ?? ShapeType.Cone;
      shape.cone = Cone.fromDescriptor(descriptor.cone, onChange);
      shape.sphere = Sphere.fromDescriptor(descriptor.sphere, onChange);
      shape.hemisphere = Sphere.fromDescriptor({ ...descriptor.hemisphere, hemisphere: true }, onChange);
    }

    return shape;
  }

  applyOverrides(descriptor?: ShapeDescriptor) {
    this._enabled.applyOverride(descriptor?.enabled)
    this._type.applyOverride(descriptor?.type)
    this.cone.applyOverrides(descriptor?.cone)
    this.sphere.applyOverrides(descriptor?.sphere)
    this.hemisphere.applyOverrides(descriptor?.hemisphere)
  }

  toDescriptor(overridesOnly = false): ShapeDescriptor | undefined {
    const descriptor = {
      enabled: this._enabled.toDescriptor(overridesOnly),
      type: this._type.toDescriptor(overridesOnly),
      cone: this.cone.toDescriptor(overridesOnly),
      sphere: this.sphere.toDescriptor(overridesOnly),
      hemisphere: this.hemisphere.toDescriptor(overridesOnly),
    }

    return removeUndefinedKeys(descriptor)
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
