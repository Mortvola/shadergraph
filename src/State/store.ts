import React from "react";
import Graph from "./Graph";

class Store {
  graph: Graph;

  dragMap: Map<string, Object>;

  constructor() {
    this.graph = new Graph();
    this.dragMap = new Map();
  }
}

const store = new Store();
const StoreContext = React.createContext(store);

const useStores = (): Store => (
  React.useContext(StoreContext)
);

export { StoreContext, store, useStores };
