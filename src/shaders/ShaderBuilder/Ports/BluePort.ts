import OutputPort from "./OutputPort";

class BluePort extends OutputPort {
  getVarName(): string {
    if (this.node.outputVarName) {
      return `${this.node.outputVarName}.b`
    }

    return '';
  }
}

export default BluePort;
