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
import { removeUndefinedKeys } from "../Properties/Types";
import { PSMaterialItem, PSRenderMode } from "../Properties/Property2";
import MaterialItem from "../MaterialItem";

class Renderer extends PSModule {
  mode: PSRenderMode;

  material: PSMaterialItem;

  drawable: DrawableInterface | null = null;

  constructor(
    materialItem: MaterialItem | undefined,
    descriptor?: RendererDescriptor,
    defaultDescriptor?: RendererDescriptor,
    onChange?: () => void,
    previousProps?: Renderer,
  ) {
    super(descriptor?.enabled, defaultDescriptor?.enabled, onChange, previousProps?.enabled);

    this.mode = new PSRenderMode(descriptor?.mode, defaultDescriptor?.mode, this.onMaterialChange, previousProps?.mode);
    this.material = new PSMaterialItem(materialItem, undefined, this.onMaterialChange, previousProps?.material);

    this.createDrawable();
  }

  onMaterialChange = () => {
    if (this.onChange) {
      this.createDrawable();
      this.onChange();
    }
  }

  copyProps(other: Renderer, noOverrides = true) {
    super.copyProps(other, noOverrides);
    this.mode.copyProp(other.mode, noOverrides);
    this.material.copyProp(other.material, noOverrides);

    this.createDrawable();
  }

  hasOverrides(): boolean {
    return (
      super.hasOverrides()
      || this.mode.override
      || this.material.override
    )
  }

  static async create(
    descriptor?: RendererDescriptor,
    defaultDescriptor?: RendererDescriptor,
    onChange?: () => void,
    previousProps?: Renderer,
  ) {
    let material: MaterialItem | undefined = undefined;

    if (descriptor?.materialId !== undefined) {
      material = await materialManager.getItem(descriptor.materialId)
    }

    return new Renderer(material, descriptor, defaultDescriptor, onChange, previousProps);
  }

  async applyOverrides(descriptor?: RendererDescriptor) {
    this.enabled.set(descriptor?.enabled, true)
    this.mode.set(descriptor?.mode, true)

    if (descriptor?.materialId !== undefined) {
      this.material.set(await materialManager.getItem(descriptor?.materialId))
      this.createDrawable();
    }  
  }

  toDescriptor(overridesOnly = false): RendererDescriptor | undefined {
    const descriptor = {
      enabled: this.enabled.toDescriptor(overridesOnly),
      mode: this.mode.toDescriptor(overridesOnly),
      materialId: (!overridesOnly || this.material.override) ? this.material.get()?.id : undefined,
    }

    return removeUndefinedKeys(descriptor)
  }

  protected setOnChange(onChange: () => void) {
    super.setOnChange(onChange)

    // if (this.mode !== undefined) {
    //   this.mode.onChange = onChange;
    // }

    // if (this.material !== undefined) {
    //   this.material.onChange = onChange;
    // }
  }

  private createDrawable() {
    switch (this.mode.get()) {
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
    switch(this.mode.get()) {
      case RenderMode.Billboard:
        return 'Billboard'

      case RenderMode.FlatBillboard:
        return 'HorizontalBillboard';
    }
  }

  async createDrawableComponent() {
    return await DrawableComponent.create(this.drawable!, this.material.get());
  }
}

export default Renderer;
