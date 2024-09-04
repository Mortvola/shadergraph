import { observable, runInAction } from "mobx";
import { RenderMode, ShapeType } from "../ParticleSystem/Types";
import type { Vec3 } from "wgpu-matrix";
import { vec3 } from "wgpu-matrix";
import type { PropsBase } from "./Types";
import PropertyBase from "./PropertyBase";

export class Property<T> extends PropertyBase {
  @observable protected accessor value: T;

  set(value?: T, override = false) {
    runInAction(() => {
      if (value !== undefined) {
        this.value = value;
        this.override = override;
      }    
    })
  }

  get() {
    return this.value;
  }

  constructor(props: PropsBase, value: T | undefined, defaultValue: T, onChange?: () => void, previousProp?: Property<T>) {
    super(props, previousProp)

    this.value = value ?? defaultValue

    // If there is a previous prop but the initial value
    // for this property is undefined then copy the value 
    // from the previous prop. Otherwise, mark this property
    // as an override of the previous prop.
    if (previousProp) {
      if (value === undefined) {
        this.copyProp(previousProp)
      }
      else {
        this.override = true;
      }
    }

    this.onChange = onChange
    this.reactOnChange(() => ({ value: this.value, override: this.override }))
  }

  copyProp(other: Property<T>) {
    runInAction(() => {
      this.value = other.value;
      this.override = false;    
    })
  }

  toDescriptor(overridesOnly = false): T | undefined {
    if (!overridesOnly || this.override) {
      return this.value
    }
  }
}

export class PSBoolean extends Property<boolean> {
  constructor(props: PropsBase, value?: boolean, defaultValue = false, onChange?: () => void, previousProp?: PSBoolean) {
    super(props, value, defaultValue, onChange, previousProp)
  }
}

export class PSNumber extends Property<number> {
  constructor(props: PropsBase, value?: number, defaultValue = 0, onChange?: () => void, previousProp?: PSNumber) {
    super(props, value, defaultValue, onChange, previousProp)
  }
}

export class PSRenderMode extends Property<RenderMode> {
  constructor(props: PropsBase, value?: RenderMode, defaultValue = RenderMode.Billboard, onChange?: () => void, previousProp?: PSRenderMode) {
    super(props, value, defaultValue, onChange, previousProp)
  }
}

export class PSShapeType extends Property<ShapeType> {
  constructor(props: PropsBase, value?: ShapeType, defaultValue = ShapeType.Cone, onChange?: () => void, previousProp?: PSShapeType) {
    super(props, value, defaultValue, onChange, previousProp)
  }
}

export class PSMaterialItem extends Property<number | undefined> {
  constructor(props: PropsBase, value: number | undefined, onChange?: () => void, previousProp?: PSMaterialItem) {
    super(props, value, undefined, onChange, previousProp)
  }
}

export class PSVec3Type extends Property<Vec3> {
  constructor(props: PropsBase, value?: Vec3, defaultValue = vec3.create(), onChange?: () => void, previousProp?: PSVec3Type) {
    super(props, value, defaultValue, onChange, previousProp)
  }

  copyProp(other: PSVec3Type) {
    runInAction(() => {
      this.value = vec3.create(...other.value);
      this.override = false;  
    })
  }

  toDescriptor(overridesOnly = false): number[] | undefined {
    if (!overridesOnly || this.override) {
      return [...this.value]
    }
  }
}
