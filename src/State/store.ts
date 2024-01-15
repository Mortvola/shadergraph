import React from "react";
import Graph from "./Graph";

class Store {
  graph: Graph;

  constructor() {
    this.graph = new Graph();
  }
}

const store = new Store();
const StoreContext = React.createContext(store);

const useStores = (): Store => (
  React.useContext(StoreContext)
);

export { StoreContext, store, useStores };
