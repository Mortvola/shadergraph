import React from "react";
import Graph from "./Graph";
import Modeler from "./Modeler";
import { GraphDescriptor } from "../shaders/ShaderBuilder/GraphDescriptor";

class Store {
  graph: Graph;

  private dragObject: unknown | null = null;

  modeler: Modeler;

  constructor() {
    let descriptor: GraphDescriptor | undefined = undefined;

    const savedItem = localStorage.getItem('graph');
    if (savedItem) {
      descriptor = JSON.parse(savedItem);
    }

    this.graph = new Graph(descriptor);
    this.modeler = new Modeler();
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
      return 'F1';

    case 'vec2f':
      return 'F2';

    case 'vec4f':
      return 'F4';

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
