import PSModule from "../Properties/PSModule";
import { RenderMode, type RendererDescriptor} from "./Types";
import { materialManager } from "../Materials/MaterialManager";
import type DrawableInterface from "../Drawables/DrawableInterface";
import Billboard from "../Drawables/Billboard";
import DrawableComponent from "../Drawables/DrawableComponent";
import type PropsBase from "../Properties/PropsBase";
import { removeUndefinedKeys } from "../Properties/Types";
import { PSMaterialItem, PSMeshItem, PSRenderAlignment, PSRenderMode } from "../Properties/Property";
import type MaterialItem from "../Materials/MaterialItem";
import { observable, runInAction } from "mobx";
import { DrawableType } from "../Drawables/DrawableInterface";
import type ModelItem from "../Models/ModelItem";
import { modelManager } from "../Models/ModelManager";
import { type DrawableComponentInterface, type RenderNodeInterface } from "../Types";
import { isRenderNode } from "../Drawables/SceneNodes/RenderNode";
import { isDrawableComponent } from "../Drawables/SceneNodes/utils";

class Renderer extends PSModule {
  mode: PSRenderMode;

  materialId: PSMaterialItem;

  @observable
  accessor material: MaterialItem | undefined = undefined;

  meshId: PSMeshItem;

  @observable
  accessor mesh: ModelItem | undefined = undefined

  drawable?: DrawableInterface;

  renderAlignment: PSRenderAlignment;

  constructor(
    props: PropsBase,
    descriptor?: RendererDescriptor,
    defaultDescriptor?: RendererDescriptor,
    onChange?: () => void,
    previousProps?: Renderer,
  ) {
    super(props, descriptor?.enabled, defaultDescriptor?.enabled, onChange, previousProps?.enabled);

    this.materialId = new PSMaterialItem('Material', props, descriptor?.materialId, this.onMaterialChange, previousProps?.materialId)
    this.meshId = new PSMeshItem('Mesh', props, descriptor?.meshId, onChange, previousProps?.meshId)
  
    this.mode = new PSRenderMode('Mode', props, descriptor?.mode, defaultDescriptor?.mode, this.onMaterialChange, previousProps?.mode);

    this.renderAlignment = new PSRenderAlignment(
      'Render Alignment', props, descriptor?.renderAlignment, defaultDescriptor?.renderAlignment,
      this.onMaterialChange, previousProps?.renderAlignment,
    );
  }

  onMaterialChange = () => {
    if (this.onChange) {
      this.createDrawable();
      this.onChange();
    }
  }

  toDescriptor(): RendererDescriptor | undefined {
    const descriptor = {
      enabled: this.enabled.toDescriptor(),
      mode: this.mode.toDescriptor(),
      materialId: this.materialId?.toDescriptor(),
      meshId: this.meshId?.toDescriptor(),
      renderAlignment: this.renderAlignment.toDescriptor(),
    }

    return removeUndefinedKeys(descriptor)
  }

  protected setOnChange(onChange: () => void) {
    super.setOnChange(onChange)
  }

  private getDrawableNode(node: RenderNodeInterface): DrawableComponentInterface | null {
    if (isRenderNode(node)) {
      for (const component of node.components) {
        if (isDrawableComponent(component)) {
          return component
        }
      }

      for (const child of node.nodes) {
        const result = this.getDrawableNode(child);

        if (result !== null) {
          return result;
        }
      }
    }

    return null;
  }

  private async createDrawable() {
    const neededType = () => {
      switch (this.mode.get()) {
        case RenderMode.Billboard:
        case RenderMode.HorizontalBillboard:
        case RenderMode.StretchedBillboard:
          return DrawableType.Billboard

        case RenderMode.Mesh:
          return DrawableType.Mesh;
      }
    }
  
    if (!this.drawable || this.drawable.type !== neededType()) {
      switch (neededType()) {
        case DrawableType.Billboard:
          this.drawable = new Billboard()
          break;

        case DrawableType.Mesh: {
          const meshId = this.meshId.get()
          if (meshId) {
            const model = await modelManager.getModel(meshId)
            
            if (model) {
              this.drawable = this.getDrawableNode(model)?.drawable
            }
          }
        }
      }
    }

    // switch (this.mode.get()) {
    //   case RenderMode.Billboard:
    //     if (!this.drawable || this.drawable.type !== DrawableType.Billboard) {
    //       this.drawable = new Billboard()
    //     }

    //     break;

    //   case RenderMode.HorizontalBillboard:
    //     if (!this.drawable || this.drawable.type !== DrawableType.HorizontalBillboard) {
    //       this.drawable = new HorizontalBillboard()
    //     }

    //     break;
    // }
  }

  async createDrawableComponent(): Promise<DrawableComponent> {
    return runInAction(async () => {
      if (this.drawable === undefined) {
        await this.createDrawable()
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

  setMesh(meshId: number) {
    runInAction(() => {
      this.meshId.set(meshId)

      // If the current mesh doesn't match the new mesh id then remove it.
      if (this.mesh !== undefined && this.mesh.id !== meshId) {
        this.mesh = undefined;
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
