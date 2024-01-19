import { makeObservable, observable } from "mobx";
import { DataType, GraphEdgeInterface, GraphNodeInterface } from "../Types";

class Port {
  node: GraphNodeInterface;

  type: DataType;

  name: string;

  edge: GraphEdgeInterface | null = null;

  offsetX = 0;

  offsetY = 0;
  
  constructor(node: GraphNodeInterface, type: DataType, name: string) {
    this.node = node;
    this.type = type;
    this.name = name;
    
    makeObservable(this, {
      edge: observable,
    })
  }
}

export default Port;
