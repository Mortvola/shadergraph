import { makeObservable, observable } from "mobx";
import { DataType, GraphEdgeInterface, GraphNodeInterface, InputPortInterface } from "../Types";
import Port from "./Port";

class InputPort extends Port implements InputPortInterface {
  edge: GraphEdgeInterface | null = null;

  constructor(node: GraphNodeInterface, dataYype: DataType, name: string) {
    super(node, dataYype, name);

    makeObservable(this, {
      edge: observable,
    })
  }

  getVarName(): string {
    return this.edge?.getVarName() ?? '';
  }

  getValue(): string {
    return this.edge?.getValue() ?? '';
  }
}

export default InputPort;
