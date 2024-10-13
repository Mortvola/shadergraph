import { makeObservable, observable } from "mobx";
import type { GraphEdgeInterface, GraphNodeInterface, InputPortInterface } from "../Types";
import Port from "./Port";
import Value from "../Value";
import type { DataType } from "../GraphDescriptor";

let constantNameId = 0;

const getConstantName = (): string => {
  const name = `const${constantNameId}`

  constantNameId += 1;

  return name;
}

export const resetConstantNames = () => {
  constantNameId = 0;
}

class InputPort extends Port implements InputPortInterface {
  edge: GraphEdgeInterface | null = null;

  value?: Value;

  constantName = getConstantName(); // used for temporary var names for the "constants" attached to an input port

  constructor(node: GraphNodeInterface, dataType: DataType, name: string) {
    super(node, dataType, name);

    switch (dataType) {
      case 'float':
        this.value = new Value(dataType, 0);
        break;

      case 'vec2f':
        this.value = new Value(dataType, [0, 0]);
        break;

      case 'vec3f':
        this.value = new Value(dataType, [0, 0, 0]);
        break;

      case 'vec4f':
        this.value = new Value(dataType, [0, 0, 0, 0]);
        break;

      case 'uv':
        this.value = new Value(dataType, 0);
        break;
    }

    makeObservable(this, {
      edge: observable,
    })
  }

  getDataType(): DataType {
    if (this.edge) {
      return this.edge.getDataType()
    }
    
    return this.dataType
  }

  getVarName(): [string, DataType] {
    return this.edge?.getVarName() ?? ['', this.dataType];
  }

  getValue(editMode: boolean): [string, DataType] {
    if (this.edge) {
      return this.edge.getValue(editMode);
    }

    if (this.value !== undefined) {
      if (editMode && this.value.dataType !== 'uv') {
        return [`fragProperties.${this.constantName}`, this.dataType];
      }

      return this.value.getValueString();
    }

    return ['', this.dataType];
  }

  connected() {
    return this.edge !== null;
  }

  unlink() {
    this.edge = null;
    this.node.notify()
  }
}

export default InputPort;
