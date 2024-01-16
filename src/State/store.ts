import React from "react";
import Graph from "./Graph";
import Modeler from "./Modeler";
import { GraphDescriptor } from "../shaders/ShaderBuilder/GraphDescriptor";

class Store {
  graph: Graph;

  dragMap: Map<string, Object>;

  modeler: Modeler;

  constructor() {
    let descriptor: GraphDescriptor | undefined = undefined;

    const savedItem = localStorage.getItem('graph');
    if (savedItem) {
      descriptor = JSON.parse(savedItem);
    }

    this.graph = new Graph(descriptor);
    this.dragMap = new Map();
    this.modeler = new Modeler();
  }
}

const store = new Store();
const StoreContext = React.createContext(store);

const useStores = (): Store => (
  React.useContext(StoreContext)
);

export { StoreContext, store, useStores };
