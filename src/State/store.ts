import React from "react";
import Graph from "./Graph";
import Modeler from "./Modeler";

class Store {
  graph: Graph;

  dragMap: Map<string, Object>;

  modeler: Modeler;

  constructor() {
    this.graph = new Graph();
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
