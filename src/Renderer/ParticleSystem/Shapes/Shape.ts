import { makeObservable, observable } from "mobx";
import { ShapeDescriptor, ShapeType } from "../Types";
import Cone from "./Cone";
import { vec4, Vec4 } from "wgpu-matrix";
import Sphere from "./Sphere";
import PSModule from "../PSModule";
import { removeUndefinedKeys } from "../../Properties/Types";
import { PSShapeType } from "../../Properties/Property2";

class Shape extends PSModule {
  type: PSShapeType;

  cone: Cone;

  sphere: Sphere;

  hemisphere: Sphere;

  constructor(
    descriptor?: ShapeDescriptor,
    defaultDescriptor: ShapeDescriptor = {},
    onChange?: () => void,
    previousProps?: Shape,
  ) {
    super(descriptor?.enabled, defaultDescriptor.enabled, onChange, previousProps?.enabled);
  
    this.type = new PSShapeType(descriptor?.type, defaultDescriptor?.type, onChange, previousProps?.type)

    this.cone = new Cone(descriptor?.cone, onChange, previousProps?.cone);
    this.sphere = new Sphere(false, descriptor?.sphere, onChange, previousProps?.sphere);
    this.hemisphere = new Sphere(true, descriptor?.hemisphere, onChange, previousProps?.hemisphere);
  }

  copyProps(other: Shape, noOverrides = true) {
    super.copyProps(other, noOverrides);
    this.type.copyProp(other.type, noOverrides);
    this.cone.copyValues(other.cone, noOverrides);
    this.sphere.copyValues(other.sphere, noOverrides);
    this.hemisphere.copyValues(other.hemisphere, noOverrides);
  }

  hasOverrides() {
    return (
      this.type.override
      || this.cone.hasOverrides()
      || this.sphere.hasOverrides()
      || this.hemisphere.hasOverrides()
    )
  }

  applyOverrides(descriptor?: ShapeDescriptor) {
    this.enabled.set(descriptor?.enabled, true)
    this.type.set(descriptor?.type, true)
    this.cone.applyOverrides(descriptor?.cone)
    this.sphere.applyOverrides(descriptor?.sphere)
    this.hemisphere.applyOverrides(descriptor?.hemisphere)
  }

  toDescriptor(overridesOnly = false): ShapeDescriptor | undefined {
    const descriptor = {
      enabled: this.enabled.toDescriptor(overridesOnly),
      type: this.type.toDescriptor(overridesOnly),
      cone: this.cone.toDescriptor(overridesOnly),
      sphere: this.sphere.toDescriptor(overridesOnly),
      hemisphere: this.hemisphere.toDescriptor(overridesOnly),
    }

    return removeUndefinedKeys(descriptor)
  }

  getPositionAndDirection(): [Vec4, Vec4] {
    if (this.enabled.get()) {
      switch (this.type.get()) {
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
