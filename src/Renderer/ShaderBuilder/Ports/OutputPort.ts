import { makeObservable, observable } from 'mobx';
import type { GraphEdgeInterface, GraphNodeInterface, OutputPortInterface } from '../Types'
import Port from './Port';
import type { DataType } from '../GraphDescriptor';

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

  connected() {
    return this.edges.length > 0;
  }

  unlink(edge: GraphEdgeInterface): void {
    const index = edge.output.edges.findIndex((e) => e === edge);

    if (index !== -1) {
      edge.output.edges = [
        ...edge.output.edges.slice(0, index),
        ...edge.output.edges.slice(index + 1),
      ];
    }
  }
}

export default OutputPort;

