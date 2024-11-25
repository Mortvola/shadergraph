import { observable, runInAction } from 'mobx';
import { RenderAlignment, RenderMode, ShapeType, SpaceType } from '../ParticleSystem/Types';
import PropertyBase from './PropertyBase';
import { vec3n, type Vec3n } from 'wgpu-matrix';

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

  applyModifications(value?: T, override = false) {
    this.disableReaction()

    runInAction(() => {
      if (value !== undefined) {
        this.value = value;
        this.override = override;
      }
    })

    this.enableReaction()
  }

  get(): T {
    return this.value;
  }

  constructor(
    value: T | undefined,
    defaultValue: T,
    onChange?: () => void,
  ) {
    super()

    this.value = value ?? defaultValue

    this.onChange = onChange
    this.reactOnChange(() => ({ value: this.value, override: this.override }))
  }

  copyProp(other: Property<T>) {
    runInAction(() => {
      this.value = other.value;
      this.override = false;
    })
  }

  toDescriptor(overridesOnly: boolean): T | undefined {
    // Only output the descriptor if this a base property or if this is an override
    if (!overridesOnly || this.override) {
      return this.value
    }
  }
}

export class PSBoolean extends Property<boolean> {
  constructor(
    value?: boolean,
    defaultValue = false,
    onChange?: () => void,
  ) {
    super(value, defaultValue, onChange)
  }
}

export class PSString extends Property<string | undefined> {
  constructor(
    value?: string,
    onChange?: () => void,
  ) {
    super(value, undefined, onChange)
  }
}

export class PSNumber extends Property<number> {
  constructor(
    value?: number,
    defaultValue = 0,
    onChange?: () => void,
  ) {
    super(value, defaultValue, onChange)
  }
}

export class PSSpace extends Property<SpaceType> {
  constructor(
    value?: SpaceType,
    defaultValue = SpaceType.Local,
    onChange?: () => void,
  ) {
    super(value, defaultValue, onChange)
  }
}

export class PSRenderMode extends Property<RenderMode> {
  constructor(
    value?: RenderMode,
    defaultValue = RenderMode.Billboard,
    onChange?: () => void,
  ) {
    super(
      value as string === 'Streteched Billboard' ? RenderMode.StretchedBillboard : value,
      defaultValue,
      onChange,
    )
  }
}

export class PSRenderAlignment extends Property<RenderAlignment> {
  constructor(
    value?: RenderAlignment,
    defaultValue = RenderAlignment.View,
    onChange?: () => void,
  ) {
    super(value, defaultValue, onChange)
  }
}

export class PSShapeType extends Property<ShapeType> {
  constructor(
    value?: ShapeType,
    defaultValue = ShapeType.Cone,
    onChange?: () => void,
  ) {
    super(value, defaultValue, onChange)
  }
}

export class PSMaterialItem extends Property<number | undefined> {
  constructor(
    value: number | undefined,
    onChange?: () => void,
  ) {
    super(value, undefined, onChange)
  }
}

export class PSMeshItem extends Property<number | undefined> {
  constructor(
    value: number | undefined,
    onChange?: () => void,
  ) {
    super(value, undefined, onChange)
  }
}

export class PSVec3Type extends Property<Vec3n> {
  constructor(
    value?: Vec3n,
    defaultValue = vec3n.create(),
    onChange?: () => void,
  ) {
    super(value, defaultValue, onChange)
  }

  copyProp(other: Property<Vec3n>) {
    runInAction(() => {
      this.value = vec3n.create(...(other as PSVec3Type).value);
      this.override = false;
    })
  }

  toDescriptor(overridesOnly: boolean): Vec3n | undefined {
    // Only output the descriptor if this a base property or if this is an override
    if (!overridesOnly || this.override) {
      return vec3n.create(...this.value)
    }
  }
}
