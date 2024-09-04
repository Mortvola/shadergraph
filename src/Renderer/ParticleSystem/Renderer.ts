import PSModule from "./PSModule";
import type { RendererDescriptor} from "./Types";
import { RenderMode } from "./Types";
import { materialManager } from "../Materials/MaterialManager";
import type DrawableInterface from "../Drawables/DrawableInterface";
import Billboard from "../Drawables/Billboard";
import HorizontalBillboard from "../Drawables/HorizontalBillboard";
import DrawableComponent from "../Drawables/DrawableComponent";
import type { PropsBase} from "../Properties/Types";
import { removeUndefinedKeys } from "../Properties/Types";
import { PSMaterialItem, PSRenderMode } from "../Properties/Property";
import type MaterialItem from "../MaterialItem";
import { observable, runInAction } from "mobx";

class Renderer extends PSModule {
  mode: PSRenderMode;

  materialId: PSMaterialItem;

  @observable
  accessor material: MaterialItem | undefined = undefined;

  drawable?: DrawableInterface;

  constructor(
    props: PropsBase,
    descriptor?: RendererDescriptor,
    defaultDescriptor?: RendererDescriptor,
    onChange?: () => void,
    previousProps?: Renderer,
  ) {
    super(props, descriptor?.enabled, defaultDescriptor?.enabled, onChange, previousProps?.enabled);

    this.materialId = new PSMaterialItem(props, descriptor?.materialId, this.onMaterialChange, previousProps?.materialId)

    this.mode = new PSRenderMode(props, descriptor?.mode, defaultDescriptor?.mode, this.onMaterialChange, previousProps?.mode);
  }

  onMaterialChange = () => {
    if (this.onChange) {
      this.createDrawable();
      this.onChange();
    }
  }

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

  async createDrawableComponent(): Promise<DrawableComponent> {
    return runInAction(async () => {
      if (this.drawable === undefined) {
        this.createDrawable()
      }

      const materialId = this.materialId?.get();

      if (materialId !== undefined && this.material === undefined) {
        this.material = await materialManager.getItem(materialId)
      }
      
      return DrawableComponent.create(this.drawable!, this.material);
    })
  }

  setMaterial(materialId: number) {
    runInAction(() => {
      this.materialId.set(materialId)

      // If the current material doesn't match the new material id then remove it.
      if (this.material !== undefined && this.material.id !== materialId) {
        this.material = undefined;
      }
    })
  }

  async getMaterialName(): Promise<string | undefined> {
    const materialId = this.materialId?.get();

    if (materialId !== undefined && this.material === undefined) {
      this.material = await materialManager.getItem(materialId)
    }

    return this.material?.name
  }
}

export default Renderer;
