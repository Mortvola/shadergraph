import type { DataType } from "../GraphDescriptor";
import OutputPort from "./OutputPort";

class BluePort extends OutputPort {
  getVarName(): [string, DataType] {
    if (this.node.getVarName()) {
      return [`${this.node.getVarName()}.b`, this.dataType]
    }

    return ['', this.dataType];
  }

  getValue(editMode: boolean): [string, DataType] {
    if (this.node.getValue(editMode)) {
      const [varA] = this.node.getValue(editMode)

      return [`(${varA}).b`, this.dataType]
    }

    return ['', this.dataType];
  }

  getDataType(): DataType {
    return 'float'
  }
}

export default BluePort;
