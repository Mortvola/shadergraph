import { observable, runInAction } from 'mobx';
import { RenderAlignment, RenderMode, ShapeType, SpaceType } from '../ParticleSystem/Types';
import type PropsBase from './PropsBase';
import PropertyBase from './PropertyBase';
import { vec3n, type Vec3n } from 'wgpu-matrix';

export class Property<T extends { toString(): string } | undefined> extends PropertyBase {
  @observable protected accessor value: T;

  set(value?: T, override = false) {
    runInAction(() => {
      if (value !== undefined) {
        this.value = value;
        this.override = override && !this.props.isTopLevel;
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

  toString(): string {
    if (this.value !== undefined) {
      return this.value.toString()
    }

    return 'undefined'
  }

  constructor(
    props: PropsBase,
    value: T | undefined,
    defaultValue: T,
    onChange?: () => void,
  ) {
    super(props)

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

  toDescriptor(): T | undefined {
    // Only output the descriptor if this a base property or if this is an override
    if (this.props.isTopLevel || this.override) {
      return this.value
    }
  }
}

export class PSBoolean extends Property<boolean> {
  constructor(
    props: PropsBase,
    value?: boolean,
    defaultValue = false,
    onChange?: () => void,
  ) {
    super(props, value, defaultValue, onChange)
  }
}

export class PSString extends Property<string | undefined> {
  constructor(
    props: PropsBase,
    value?: string,
    defaultValue = undefined,
    onChange?: () => void,
  ) {
    super(props, value, defaultValue, onChange)
  }
}

export class PSNumber extends Property<number> {
  constructor(
    props: PropsBase,
    value?: number,
    defaultValue = 0,
    onChange?: () => void,
  ) {
    super(props, value, defaultValue, onChange)
  }
}

export class PSSpace extends Property<SpaceType> {
  constructor(
    props: PropsBase,
    value?: SpaceType,
    defaultValue = SpaceType.Local,
    onChange?: () => void,
  ) {
    super(props, value, defaultValue, onChange)
  }
}

export class PSRenderMode extends Property<RenderMode> {
  constructor(
    props: PropsBase,
    value?: RenderMode,
    defaultValue = RenderMode.Billboard,
    onChange?: () => void,
  ) {
    super(
      props,
      value as string === 'Streteched Billboard' ? RenderMode.StretchedBillboard : value,
      defaultValue,
      onChange,
    )
  }
}

export class PSRenderAlignment extends Property<RenderAlignment> {
  constructor(
    props: PropsBase,
    value?: RenderAlignment,
    defaultValue = RenderAlignment.View,
    onChange?: () => void,
  ) {
    super(props, value, defaultValue, onChange)
  }
}

export class PSShapeType extends Property<ShapeType> {
  constructor(
    props: PropsBase,
    value?: ShapeType,
    defaultValue = ShapeType.Cone,
    onChange?: () => void,
  ) {
    super(props, value, defaultValue, onChange)
  }
}

export class PSMaterialItem extends Property<number | undefined> {
  constructor(
    props: PropsBase,
    value: number | undefined,
    onChange?: () => void,
  ) {
    super(props, value, undefined, onChange)
  }
}

export class PSMeshItem extends Property<number | undefined> {
  constructor(
    props: PropsBase,
    value: number | undefined,
    onChange?: () => void,
  ) {
    super(props, value, undefined, onChange)
  }
}

export class PSVec3Type extends Property<Vec3n> {
  constructor(
    props: PropsBase,
    value?: Vec3n,
    defaultValue = vec3n.create(),
    onChange?: () => void,
  ) {
    super(props, value, defaultValue, onChange)
  }

  copyProp(other: Property<Vec3n>) {
    runInAction(() => {
      this.value = vec3n.create(...(other as PSVec3Type).value);
      this.override = false;
    })
  }

  toDescriptor(): Vec3n | undefined {
    // Only output the descriptor if this a base property or if this is an override
    if (this.props.isTopLevel || this.override) {
      return vec3n.create(...this.value)
    }
  }
}
