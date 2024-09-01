import { observable, reaction, runInAction } from "mobx";
import { MaterialItemInterface } from "../../State/types";
import { RenderMode, ShapeType } from "../ParticleSystem/Types";
import { vec3, Vec3 } from "wgpu-matrix";

export class Property2<T> {
  @observable accessor override = false;

  @observable accessor value: T;

  constructor(value: T, onChange?: () => void) {
    this.value = value;
  }
}

export type PropertyType<T> = { value: T, override?: boolean }

export class Property {
  @observable accessor override = false;

  onChange?: () => void;

  constructor(onChange?: () => void) {
    this.onChange = onChange
  }

  reactOnChange(f: () => any) {
    reaction(f, () => {
      if (this.onChange) {
        this.onChange()
      }
    })
  }
}

export class PSScalarType<T> extends Property {
  @observable accessor v: T;

  get value(): T {
    return this.v;
  }

  set value(newValue: { value: T, override?: boolean}) {
    runInAction(() => {
      this.v = newValue.value;
      this.override = newValue.override ?? this.override;
    })
  }

  applyOverride(value?: T) {
    if (value !== undefined) {
      this.value = { value, override: true }
    }
  }

  constructor(value: T, onChange?: () => void) {
    super(onChange)
    
    this.v = value;

    this.reactOnChange(() => this.v)
  }

  copyValues(other: PSScalarType<T>, noOverrides = true) {
    runInAction(() => {
      if (!this.override || !noOverrides) {
        this.v = other.v;
      }  
    })
  }

  toDescriptor(overridesOnly = false): T | undefined {
    if (!overridesOnly || this.override) {
      return this.v
    }
  }
}

export class PSBoolean extends PSScalarType<boolean> {
  constructor(value = false, onChange?: () => void) {
    super(value, onChange)
  }
}

export class PSNumber extends PSScalarType<number> {
  constructor(value = 0, onChange?: () => void) {
    super(value, onChange)
  }
}

export class PSRenderMode extends PSScalarType<RenderMode> {
  constructor(value = RenderMode.Billboard, onChange?: () => void) {
    super(value, onChange)
  }
}

export class PSShapeType extends PSScalarType<ShapeType> {
  constructor(value = ShapeType.Cone, onChange?: () => void) {
    super(value, onChange)
  }
}

export class PSMaterialItem extends PSScalarType<MaterialItemInterface | undefined> {
}

export class PSVec3Type extends PSScalarType<Vec3> {
  constructor(value = vec3.create(), onChange?: () => void) {
    super(value, onChange)
  }

  copyValues(other: PSVec3Type, noOverrides = true) {
    runInAction(() => {
      if (!this.override || !noOverrides) {
        vec3.copy(other.v, this.v);
      }  
    })
  }

  toDescriptor(overridesOnly = false): number[] | undefined {
    if (!overridesOnly || this.override) {
      return [...this.v]
    }
  }
}

export const removeUndefinedKeys = <T extends Record<string, unknown>>(obj: T): T | undefined => {
  Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
  return Object.keys(obj).length > 0 ? obj : undefined;
};
