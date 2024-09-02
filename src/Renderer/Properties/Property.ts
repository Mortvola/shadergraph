import { observable, reaction, runInAction } from "mobx";
import { RenderMode, ShapeType } from "../ParticleSystem/Types";
import { MaterialItemInterface } from "../../State/types";
import { vec3, Vec3 } from "wgpu-matrix";

export class PropertyBase {
  @observable accessor override = false;

  ancestor?: PropertyBase

  onChange?: () => void;

  onRevertOverride?: () => void;

  constructor(previousProp?: PropertyBase) {
    this.ancestor = previousProp;
  }

  revertOverride() {
    if (this.onRevertOverride) {
      this.onRevertOverride()
    }
  }

  reactOnChange(f: () => unknown) {
    reaction(f, () => {
      if (this.onChange) {
        this.onChange()
      }
    })
  }
}

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

  constructor(value: T | undefined, defaultValue: T, onChange?: () => void, previousProp?: Property<T>) {
    super(previousProp)

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
    this.reactOnChange(() => this.value)
  }

  copyProp(other: Property<T>, noOverrides = true) {
    runInAction(() => {
      if (!this.override || !noOverrides) {
        this.value = other.value;
      }  
    })
  }

  revertOverride() {
    if (this.ancestor) {
      runInAction(() => {
        this.value = (this.ancestor as Property<T>).value;
        this.override = false;  
      })
    }

    super.revertOverride()
  }

  toDescriptor(overridesOnly = false): T | undefined {
    if (!overridesOnly || this.override) {
      return this.value
    }
  }
}

export class PSBoolean extends Property<boolean> {
  constructor(value?: boolean, defaultValue = false, onChange?: () => void, previousProp?: Property<boolean>) {
    super(value, defaultValue, onChange, previousProp)
  }
}

export class PSNumber extends Property<number> {
  constructor(value?: number, defaultValue = 0, onChange?: () => void, previousProp?: Property<number>) {
    super(value, defaultValue, onChange, previousProp)
  }
}

export class PSRenderMode extends Property<RenderMode> {
  constructor(value?: RenderMode, defaultValue = RenderMode.Billboard, onChange?: () => void, previousProp?: Property<RenderMode>) {
    super(value, defaultValue, onChange, previousProp)
  }
}

export class PSShapeType extends Property<ShapeType> {
  constructor(value?: ShapeType, defaultValue = ShapeType.Cone, onChange?: () => void, previousProp?: Property<ShapeType>) {
    super(value, defaultValue, onChange, previousProp)
  }
}

export class PSMaterialItem extends Property<MaterialItemInterface | undefined> {
}

export class PSVec3Type extends Property<Vec3> {
  constructor(value?: Vec3, defaultValue = vec3.create(), onChange?: () => void, previousProp?: Property<Vec3>) {
    super(value, defaultValue, onChange, previousProp)
  }

  copyProp(other: PSVec3Type, noOverrides = true) {
    runInAction(() => {
      if (!this.override || !noOverrides) {
        vec3.copy(other.value, this.value);
      }  
    })
  }

  toDescriptor(overridesOnly = false): number[] | undefined {
    if (!overridesOnly || this.override) {
      return [...this.value]
    }
  }
}
