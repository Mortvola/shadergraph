import { DataType } from "../Types";
import OutputPort from "./OutputPort";

class AlphaPort extends OutputPort {
  getVarName(): [string, DataType] {
    if (this.node.getVarName()) {
      return [`${this.node.getVarName()}.a`, this.dataType]
    }

    return ['', this.dataType];
  }

  getValue(editMode: boolean): [string, DataType] {
    if (this.node.getValue(editMode)) {
      const [varA] = this.node.getValue(editMode)

      return [`(${varA}).a`, this.dataType]
    }

    return ['', this.dataType];
  }

  getDataType(): DataType {
    return 'float'
  }
}

export default AlphaPort;
