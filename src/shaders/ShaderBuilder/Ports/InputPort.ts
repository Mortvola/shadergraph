import { GraphEdgeInterface, GraphNodeInterface, InputPortInterface, DataType } from "../Types";

class InputPort implements InputPortInterface {
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
  }

  getVarname(): string {
    return this.edge?.getVarName() ?? '';
  }
}

export default InputPort;
