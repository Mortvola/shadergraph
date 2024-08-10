import BuiltIn from "../BuiltInNode";
import { GraphNodeDescriptor } from "../GraphDescriptor";
import OutputPort from "../Ports/OutputPort";

class Time extends BuiltIn {
  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('time', 'Time', false,  nodeDescriptor?.id)

    this.outputPort = [new OutputPort(this, 'float', 'time')];
    this.setVarName('time');
  }

  setVarName(varName: string | null): void {
    super.setVarName('time');
  }
}

export default Time;
