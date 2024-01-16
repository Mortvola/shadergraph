import OutputPort from "../OutputPort";
import PropertyNode from "../PropertyNode";

class Time extends PropertyNode {
  constructor(id?: number) {
    super('time', 'float', 'Time', id)

    this.outputPort = new OutputPort(this, 'float', 'time');
    this.outputPort.varName = 'time';

    this.readonly = true;
  }
}

export default Time;
