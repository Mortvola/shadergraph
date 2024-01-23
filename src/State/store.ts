import React from "react";
import Graph from "./Graph";
import Modeler from "./Modeler";
import { StoreInterface } from "./types";
import { makeObservable, observable } from "mobx";

type OpenMenuItem = {
  menuItem: HTMLElement,
  menuRect: DOMRect,
}

class Store implements StoreInterface {
  graph: Graph | null = null;

  private dragObject: unknown | null = null;

  modeler: Modeler;

  menus: OpenMenuItem[] = [];

  constructor() {
    this.modeler = new Modeler();

    makeObservable(this, {
      menus: observable,
      graph: observable,
    })
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
