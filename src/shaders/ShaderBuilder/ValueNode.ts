import GraphNode from "./GraphNode";
import OutputPort from "./Ports/OutputPort";
import { ValueNodeInterface } from "./Types";
import Value from "./Value";

class ValueNode extends GraphNode implements ValueNodeInterface {
  value: Value;

  constructor(value: Value, id?: number) {
    super('value', id);

    this.outputPort = [new OutputPort(this, value.dataType, '')];

    this.value = value;
  }

  getVarName(): string | null {
    return this.value.getValueString();
  }
}

export default ValueNode;
