import React from "react";
import Graph from "./Graph";
import Modeler from "./Modeler";
import { MaterialRecord, StoreInterface } from "./types";
import { makeObservable, observable, runInAction } from "mobx";
import Renderer from "../Renderer/Renderer";
import Http from "../Http/src";
import { PropertyInterface } from "../Renderer/ShaderBuilder/Types";
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

  menus: OpenMenuItem[] = [];

  mainView: Renderer;

  shaderPreview: Renderer;

  materials: Materials;

  selectedMaterial: MaterialRecord   | null = null;

  private constructor(mainRenderer: Renderer, previewRenderer: Renderer) {
    this.mainView = mainRenderer;
    this.shaderPreview = previewRenderer;

    this.mainViewModeler = new Modeler(this.mainView);
    this.modeler = new Modeler(previewRenderer);

    this.materials = new Materials();

    makeObservable(this, {
      menus: observable,
      graph: observable,
      selectedMaterial: observable,
    })
  }

  static async create() {
    const mainRenderer = await Renderer.create();
    const previewRenderer = await Renderer.create();

    return new Store(mainRenderer, previewRenderer)
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

  async selectObject(id: number) {
    let response = await Http.get<{ object: { modelId: number } }>(`/game-objects/${id}`)

    if (response.ok) {
      const object = await response.body();

      this.mainViewModeler.loadModel(`/models/${object.object.modelId}`);
    }
  }

  async selectMaterial(materialRecord: MaterialRecord) {
    runInAction(() => {
      this.selectedMaterial = materialRecord
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
