import { DataType } from "../Types";
import OutputPort from "./OutputPort";

class RGBPort extends OutputPort {
  getVarName(): [string, DataType] {
    if (this.node.getVarName()) {
      return [`${this.node.getVarName()}.rgb`, this.dataType]
    }

    return ['', this.dataType];
  }

  getValue(editMode: boolean): [string, DataType] {
    if (this.node.getValue(editMode)) {
      const [varA] = this.node.getValue(editMode)

      return [`(${varA}).rgb`, this.dataType]
    }

    return ['', this.dataType];
  }

  getDataType(): DataType {
    return 'vec3f'
  }
}

export default RGBPort;
