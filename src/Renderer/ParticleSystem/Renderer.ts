import { makeObservable, observable, runInAction } from "mobx";
import PSModule from "./PSModule";
import { RendererDescriptor, RenderMode } from "./Types";
import { MaterialItemInterface } from "../../State/types";
import { materialManager } from "../Materials/MaterialManager";
import { DrawableType, MaterialInterface } from "../types";
import DrawableInterface from "../Drawables/DrawableInterface";
import Billboard from "../Drawables/Billboard";
import HorizontalBillboard from "../Drawables/HorizontalBillboard";
import DrawableComponent from "../Drawables/DrawableComponent";

class Renderer extends PSModule {
  mode = RenderMode.Billboard;

  material?: MaterialItemInterface;

  drawable: DrawableInterface | null = null;

  constructor(onChange?: () => void) {
    super(onChange);

    makeObservable(this, {
      mode: observable,
      material: observable,
    })
  }

  static async fromDescriptor(descriptor: RendererDescriptor | undefined, onChange?: () => void) {
    const renderer = new Renderer(onChange);

    if (descriptor) {
      renderer.enabled = descriptor.enabled ?? false;
      renderer.mode = descriptor.mode ?? RenderMode.Billboard;

      if (descriptor?.materialId !== undefined) {
        renderer.material = await materialManager.getItem(descriptor?.materialId)
      }  
    }

    renderer.createDrawable();

    return renderer;
  }

  toDescriptor(): RendererDescriptor {
    return ({
      enabled: this.enabled,
      mode: this.mode,
      materialId: this.material?.id,
    })
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

  setRenderMode(mode: RenderMode) {
    runInAction(() => {
      this.mode = mode;

      this.createDrawable()

      if (this.onChange) {
        this.onChange()
      }
    })
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

  async setMaterial(materialItem: MaterialItemInterface) {
    runInAction(() => {
      this.material = materialItem;
      
      if (this.onChange) {
        this.onChange()
      }
    })
  }
}

export default Renderer;
