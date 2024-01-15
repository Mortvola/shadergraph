import OperationNode from "../OperationNode";
import OutputPort from "../OutputPort";

class Time extends OperationNode {
  constructor(id?: number) {
    super('time', id)

    this.outputPort = new OutputPort(this, 'float', 'time');
    this.outputPort.varName = 'time';
  }
}

export default Time;
