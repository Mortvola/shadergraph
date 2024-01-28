import React from "react";
import Graph from "./Graph";
import Modeler from "./Modeler";
import { GameObjectRecord, MaterialRecord, ModelRecord, ShaderRecord, StoreInterface, TextureRecord } from "./types";
import { makeObservable, observable, runInAction } from "mobx";
import Renderer from "../Renderer/Renderer";
import Http from "../Http/src";
import Materials from "./Materials";

type OpenMenuItem = {
  menuItem: HTMLElement,
  menuRect: DOMRect,
}

class Store implements StoreInterface {
  graph: Graph | null = null;

  private dragObject: unknown | null = null;

  modeler: Modeler;

  mainViewModeler: Modeler;

  models: ModelRecord[] = [];

  menus: OpenMenuItem[] = [];

  mainView: Renderer;

  shaderPreview: Renderer;

  materials: Materials;

  selectionType: 'Material' | 'Object' | 'Texture' | 'Shader' | 'Model' | null = null;

  selectedMaterial: MaterialRecord | null = null;

  selectedTexture: TextureRecord | null = null;

  selectedGameObject: GameObjectRecord | null = null;

  selectedShader: ShaderRecord | null = null;

  selectedModel: ModelRecord | null = null;

  private constructor(mainRenderer: Renderer, previewRenderer: Renderer) {
    this.mainView = mainRenderer;
    this.shaderPreview = previewRenderer;

    this.mainViewModeler = new Modeler(this.mainView, this);
    this.modeler = new Modeler(previewRenderer, this);

    this.materials = new Materials();

    makeObservable(this, {
      menus: observable,
      graph: observable,
      selectionType: observable,
      selectedMaterial: observable,
      selectedTexture: observable,
      selectedGameObject: observable,
      selectedShader: observable,
      selectedModel: observable,
      models: observable,
    })
  }

  static async create() {
    const mainRenderer = await Renderer.create();
    const previewRenderer = await Renderer.create();

    return new Store(mainRenderer, previewRenderer)
  }

  getModel(id: number): ModelRecord | undefined {
    return this.models.find((m) => m.id === id);
  }

  async applyChanges(): Promise<void> {
    if (this.graph) {
      const material = await this.graph.generateMaterial();

      if (material) {
        this.modeler.applyMaterial(material);
      }  
    }
  }

  setDragObject(object: unknown | null) {
    this.dragObject = object;
  }

  getDragObject(): unknown | null {
    return this.dragObject;
  }

  async selectObject(gameObject: GameObjectRecord | null) {
    if (gameObject !== null) {
      let response = await Http.get<GameObjectRecord>(`/game-objects/${gameObject.id}`)

      if (response.ok) {
        const object = await response.body();

        this.mainViewModeler.loadModel(`/models/${object.object.modelId}`, object.object.materials);
      }
    }

    runInAction(() => {
      this.selectionType = 'Object'
      this.selectedGameObject = gameObject;
    })
  }

  async selectMaterial(materialRecord: MaterialRecord) {
    runInAction(() => {
      this.selectionType = 'Material'
      this.selectedMaterial = materialRecord
    })
  }

  async selectTexture(textureRecord: TextureRecord) {
    runInAction(() => {
      this.selectionType = 'Texture'
      this.selectedTexture = textureRecord
    })
  }

  async selectShader(shaderRecord: ShaderRecord) {
    runInAction(() => {
      this.selectionType = 'Shader'
      this.selectedShader = shaderRecord
    })
  }

  async selectModel(modelRecord: ModelRecord) {
    runInAction(() => {
      this.selectionType = 'Model'
      this.selectedModel = modelRecord
    })
  }
}

export const convertType = (type: string) => {
  switch (type) {
    case 'float':
      return '1';

    case 'vec2f':
      return '2';

    case 'vec4f':
      return '4';

    case 'texture2D':
      return 'T2';

    case 'sampler':
      return 'S';

    default:
      return type;
  }
}

const store = await Store.create();
const StoreContext = React.createContext(store);

const useStores = (): Store => (
  React.useContext(StoreContext)
);

export { StoreContext, store, useStores };
