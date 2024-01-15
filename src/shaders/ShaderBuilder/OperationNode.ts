import GraphNode from "./GraphNode";
import InputPort from "./InputPort";
import OutputPort from "./OutputPort";
import { OperationNodeInterface, } from "./Types";

class OperationNode extends GraphNode implements OperationNodeInterface {
  inputPorts: InputPort[] = [];

  outputPort: OutputPort | null = null;

  output(): string { 
    return '';   
  }
}

export default OperationNode;
