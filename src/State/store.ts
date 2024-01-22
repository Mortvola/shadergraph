import React from "react";
import Graph from "./Graph";
import Modeler from "./Modeler";
import { StoreInterface } from "./types";
import { MaterialDescriptor } from "../Renderer/Materials/MaterialDescriptor";
import { makeObservable, observable } from "mobx";

type OpenMenuItem = {
  menuItem: HTMLElement,
  menuRect: DOMRect,
}

class Store implements StoreInterface {
  graph: Graph;

  private dragObject: unknown | null = null;

  modeler: Modeler;

  menus: OpenMenuItem[] = [];

  constructor() {
    let descriptor: MaterialDescriptor | undefined = undefined;

    const savedItem = localStorage.getItem('material');
    if (savedItem) {
      descriptor = JSON.parse(savedItem);
    }

    this.graph = new Graph(this, descriptor);
    this.modeler = new Modeler();

    makeObservable(this, {
      menus: observable,
    })
  }

  async applyChanges(): Promise<void> {
    const material = await this.graph.generateMaterial();

    if (material) {
      this.modeler.applyMaterial(material);
    }
  }

  setDragObject(object: unknown | null) {
    this.dragObject = object;
  }

  getDragObject(): unknown | null {
    return this.dragObject;
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

const store = new Store();
const StoreContext = React.createContext(store);

const useStores = (): Store => (
  React.useContext(StoreContext)
);

export { StoreContext, store, useStores };
