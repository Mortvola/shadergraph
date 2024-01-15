import { makeAutoObservable } from "mobx";
import GraphNode from "./GraphNode";

class Graph {
  nodes: GraphNode[] = [];

  constructor() {
    this.nodes = [
      new GraphNode(),
      new GraphNode(),
    ];

    makeAutoObservable(this);
  }
}

export default Graph;
