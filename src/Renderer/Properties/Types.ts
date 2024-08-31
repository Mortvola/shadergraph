import { makeObservable, observable, reaction, runInAction } from "mobx";
import { MaterialItemInterface } from "../../State/types";
import { RenderMode, ShapeType } from "../ParticleSystem/Types";
import { vec3, Vec3 } from "wgpu-matrix";

export class Property {
  override = false;

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
  v: T;

  get value(): T {
    return this.v;
  }

  set value(newValue: T) {
    runInAction(() => {
      this.v = newValue;
    })
  }

  constructor(value: T, onChange?: () => void) {
    super(onChange)
    
    this.v = value;

    makeObservable(this, {
      v: observable,
    })

    this.reactOnChange(() => this.v)
  }

  copyValues(other: PSScalarType<T>, noOverrides = true) {
    runInAction(() => {
      if (!this.override || !noOverrides) {
        this.v = other.v;
      }  
    })
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
}
