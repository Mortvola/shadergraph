import { DataType, GraphNodeInterface } from "../Types";

class Port {
  node: GraphNodeInterface;

  type: DataType;

  name: string;

  offsetX = 0;

  offsetY = 0;
  
  constructor(node: GraphNodeInterface, dataType: DataType, name: string) {
    this.node = node;
    this.type = dataType;
    this.name = name;    
  }
}

export default Port;
