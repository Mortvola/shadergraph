import { makeObservable, observable } from "mobx";
import { GraphEdgeInterface, GraphNodeInterface, OutputPortInterface } from "../Types"
import Port from "./Port";
import { DataType } from "../GraphDescriptor";

class OutputPort extends Port implements OutputPortInterface {
  edges: GraphEdgeInterface[] = [];

  constructor(node: GraphNodeInterface, dataType: DataType, name: string) {
    super(node, dataType, name);

    makeObservable(this, {
      edges: observable,
    })
  }

  getDataType(): DataType {
    return this.node.getDataType()
  }

  getVarName(): [string, DataType] {
    return this.node.getVarName() ?? ['', this.dataType];
  }

  getValue(editMode: boolean): [string, DataType] {
    return this.node.getValue(editMode) ?? ['', this.dataType];
  }
}

export default OutputPort;

