import { makeObservable, observable } from "mobx";
import PSModule from "./PSModule";
import { RendererDescriptor, RenderMode } from "./Types";
import { MaterialItemInterface } from "../../State/types";
import { materialManager } from "../Materials/MaterialManager";
import { DrawableType } from "../Types";
import DrawableInterface from "../Drawables/DrawableInterface";
import Billboard from "../Drawables/Billboard";
import HorizontalBillboard from "../Drawables/HorizontalBillboard";
import DrawableComponent from "../Drawables/DrawableComponent";
import { PSMaterialItem, PSRenderMode, removeUndefinedKeys } from "../Properties/Types";

class Renderer extends PSModule {
  _mode: PSRenderMode;

  get mode(): RenderMode {
    return this._mode.value
  }

  set mode(value: RenderMode) {
    this._mode.value = { value };
  }

  _material: PSMaterialItem;

  get material(): MaterialItemInterface | undefined {
    return this._material.value
  }

  set material(value: MaterialItemInterface | undefined) {
    this._material.value = { value };
  }

  drawable: DrawableInterface | null = null;

  constructor(onChange?: () => void) {
    super(onChange);

    this._mode = new PSRenderMode(RenderMode.Billboard, onChange);
    this._material = new PSMaterialItem(undefined, onChange);

    makeObservable(this, {
      _mode: observable,
      _material: observable,
    })
  }

  copyValues(other: Renderer, noOverrides = true) {
    super.copyValues(other, noOverrides);
    this._mode.copyValues(other._mode, noOverrides);
    this._material.copyValues(other._material, noOverrides);

    this.createDrawable();
  }

  hasOverrides(): boolean {
    return (
      super.hasOverrides()
      || this._mode.override
      || this._material.override
    )
  }

  static async fromDescriptor(descriptor: RendererDescriptor | undefined, onChange?: () => void) {
    const renderer = new Renderer(onChange);

    if (descriptor) {
      renderer.enabled = descriptor.enabled ?? false;
      renderer.mode = descriptor.mode ?? RenderMode.Billboard;

      if (descriptor?.materialId !== undefined) {
        renderer.material = await materialManager.getItem(descriptor?.materialId)
        renderer.createDrawable();
      }  
    }

    return renderer;
  }

  async applyOverrides(descriptor?: RendererDescriptor) {
    this._enabled.applyOverride(descriptor?.enabled)
    this._mode.applyOverride(descriptor?.mode)

    if (descriptor?.materialId !== undefined) {
      this.material = await materialManager.getItem(descriptor?.materialId)
      this.createDrawable();
    }  
  }

  toDescriptor(overridesOnly = false): RendererDescriptor | undefined {
    const descriptor = {
      enabled: this._enabled.toDescriptor(overridesOnly),
      mode: this._mode.toDescriptor(overridesOnly),
      materialId: (!overridesOnly || this._material.override) ? this.material?.id : undefined,
    }

    return removeUndefinedKeys(descriptor)
  }

  protected setOnChange(onChange: () => void) {
    super.setOnChange(onChange)

    if (this._mode !== undefined) {
      this._mode.onChange = onChange;
    }

    if (this._material !== undefined) {
      this._material.onChange = onChange;
    }
  }

  private createDrawable() {
    switch (this.mode) {
      case RenderMode.Billboard:
        if (!this.drawable || this.drawable.type !== 'Billboard') {
          this.drawable = new Billboard()
        }

        break;

      case RenderMode.FlatBillboard:
        if (!this.drawable || this.drawable.type !== 'HorizontalBillboard') {
          this.drawable = new HorizontalBillboard()
        }

        break;
    }
  }

  getDrawableType(): DrawableType | undefined {
    switch(this.mode) {
      case RenderMode.Billboard:
        return 'Billboard'

      case RenderMode.FlatBillboard:
        return 'HorizontalBillboard';
    }
  }

  async createDrawableComponent() {
    return await DrawableComponent.create(this.drawable!, this.material);
  }
}

export default Renderer;
