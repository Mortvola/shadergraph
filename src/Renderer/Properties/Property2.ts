import { observable, reaction, runInAction } from "mobx";
import { RenderMode, ShapeType } from "../ParticleSystem/Types";
import { MaterialItemInterface } from "../../State/types";
import { vec3, Vec3 } from "wgpu-matrix";

export class Property2Base {
  @observable accessor override = false;

  onChange?: () => void;

  onRevertOverride?: () => void;

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

export class Property2<T> extends Property2Base {
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

  constructor(value: T, onChange?: () => void) {
    super()

    this.value = value;

    this.onChange = onChange
    this.reactOnChange(() => this.value)
  }

  copyValues(other: Property2<T>, noOverrides = true) {
    runInAction(() => {
      if (!this.override || !noOverrides) {
        this.value = other.value;
      }  
    })
  }

  toDescriptor(overridesOnly = false): T | undefined {
    if (!overridesOnly || this.override) {
      return this.value
    }
  }
}

export class PSBoolean extends Property2<boolean> {
  constructor(value = false, onChange?: () => void) {
    super(value, onChange)
  }
}

export class PSNumber extends Property2<number> {
  constructor(value = 0, onChange?: () => void) {
    super(value, onChange)
  }
}

export class PSRenderMode extends Property2<RenderMode> {
  constructor(value = RenderMode.Billboard, onChange?: () => void) {
    super(value, onChange)
  }
}

export class PSShapeType extends Property2<ShapeType> {
  constructor(value = ShapeType.Cone, onChange?: () => void) {
    super(value, onChange)
  }
}

export class PSMaterialItem extends Property2<MaterialItemInterface | undefined> {
}

export class PSVec3Type extends Property2<Vec3> {
  constructor(value = vec3.create(), onChange?: () => void) {
    super(value, onChange)
  }

  copyValues(other: PSVec3Type, noOverrides = true) {
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
