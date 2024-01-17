import OutputPort from "../Ports/OutputPort";
import PropertyNode from "../PropertyNode";

class Time extends PropertyNode {
  constructor(id?: number) {
    super('time', 'float', 'Time', id)

    this.outputPort = [new OutputPort(this, 'float', 'time')];
    this.outputVarName = 'time';

    this.readonly = true;
  }
}

export default Time;
