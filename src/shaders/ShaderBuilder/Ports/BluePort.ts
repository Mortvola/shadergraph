import OutputPort from "./OutputPort";

class BluePort extends OutputPort {
  getVarName(): string {
    if (this.node.getVarName()) {
      return `${this.node.getVarName()}.b`
    }

    return '';
  }
}

export default BluePort;
