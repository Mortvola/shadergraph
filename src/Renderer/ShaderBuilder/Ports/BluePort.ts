import { DataType } from "../Types";
import OutputPort from "./OutputPort";

class BluePort extends OutputPort {
  getVarName(): [string, DataType] {
    if (this.node.getVarName()) {
      return [`${this.node.getVarName()}.b`, this.dataType]
    }

    return ['', this.dataType];
  }

  getValue(): [string, DataType] {
    if (this.node.getValue()) {
      const [varA] = this.node.getValue()

      return [`(${varA}).b`, this.dataType]
    }

    return ['', this.dataType];
  }

  getDataType(): DataType {
    return 'float'
  }
}

export default BluePort;
