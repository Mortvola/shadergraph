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
import { PropsBase, removeUndefinedKeys } from "../Properties/Types";
import { PSMaterialItem, PSNumber, PSRenderMode } from "../Properties/Property";
import MaterialItem from "../MaterialItem";

class Renderer extends PSModule {
  mode: PSRenderMode;

  materialId?: PSNumber;

  // material: PSMaterialItem;

  material?: MaterialItem;

  drawable?: DrawableInterface;

  constructor(
    props: PropsBase,
    descriptor?: RendererDescriptor,
    defaultDescriptor?: RendererDescriptor,
    onChange?: () => void,
    previousProps?: Renderer,
  ) {
    super(props, descriptor?.enabled, defaultDescriptor?.enabled, onChange, previousProps?.enabled);

    this.materialId = new PSNumber(props, descriptor?.materialId, defaultDescriptor?.materialId, this.onMaterialChange, previousProps?.materialId)

    this.mode = new PSRenderMode(props, descriptor?.mode, defaultDescriptor?.mode, this.onMaterialChange, previousProps?.mode);
    // this.material = new PSMaterialItem(materialItem, undefined, this.onMaterialChange, previousProps?.material);

    // this.createDrawable();
  }

  onMaterialChange = () => {
    if (this.onChange) {
      this.createDrawable();
      this.onChange();
    }
  }

  // static async create(
  //   descriptor?: RendererDescriptor,
  //   defaultDescriptor?: RendererDescriptor,
  //   onChange?: () => void,
  //   previousProps?: Renderer,
  // ) {
  //   let material: MaterialItem | undefined = undefined;

  //   if (descriptor?.materialId !== undefined) {
  //     material = await materialManager.getItem(descriptor.materialId)
  //   }

  //   return new Renderer(material, descriptor, defaultDescriptor, onChange, previousProps);
  // }

  toDescriptor(overridesOnly = false): RendererDescriptor | undefined {
    const descriptor = {
      enabled: this.enabled.toDescriptor(overridesOnly),
      mode: this.mode.toDescriptor(overridesOnly),
      materialId: this.materialId?.toDescriptor(overridesOnly),
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

  // getDrawableType(): DrawableType | undefined {
  //   switch(this.mode.get()) {
  //     case RenderMode.Billboard:
  //       return 'Billboard'

  //     case RenderMode.FlatBillboard:
  //       return 'HorizontalBillboard';
  //   }
  // }

  async createDrawableComponent() {
    if (this.drawable === undefined) {
      this.createDrawable()
    }

    if (this.materialId?.get() !== undefined && this.material === undefined) {
      this.material = await materialManager.getItem(this.materialId.get())
    }  

    return await DrawableComponent.create(this.drawable!, this.material);
  }
}

export default Renderer;
