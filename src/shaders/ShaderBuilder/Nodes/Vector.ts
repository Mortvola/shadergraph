import OutputPort from "../Ports/OutputPort";
import { DataType } from "../Types";
import Value from "../Value";
import ValueNode from "../ValueNode";

class Vector extends ValueNode {
  constructor(length: number, id?: number) {
    if (length <= 1 || length > 4) {
      throw new Error('invalid vector length')
    }
    
    const dataType = `vec${length}f` as DataType;

    super(new Value(dataType, Array(length).fill(0)), id)

    this.outputPort = [new OutputPort(this, dataType, `vector${length}`)];
  }
}

export default Vector;
