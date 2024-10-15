import { runInAction } from 'mobx';
import type { GraphEdgeInterface, InputPortInterface, OutputPortInterface } from './Types';
import type { DataType } from './GraphDescriptor';

class GraphEdge implements GraphEdgeInterface {
  output: OutputPortInterface;

  input: InputPortInterface;

  constructor(outputPort: OutputPortInterface, inputPort: InputPortInterface) {
    this.output = outputPort;

    this.input = inputPort;

    runInAction(() => {
      outputPort.edges.push(this);
      inputPort.edge = this;
    })

    inputPort.node.notify()
  }

  getDataType(): DataType {
    return this.output.getDataType()
  }

  getVarName(): [string, DataType] {
    return this.output.getVarName() ?? ['', 'float'];
  }

  getValue(editMode: boolean): [string, DataType] {
    return this.output.getValue(editMode) ?? ['', 'float'];
  }

  unlink() {
    this.output.unlink(this)

    this.input.unlink()
  }
}

export default GraphEdge;

