import OutputPort from "./OutputPort";

class GreenPort extends OutputPort {
  getVarName(): string {
    if (this.node.getVarName()) {
      return `${this.node.getVarName()}.g`
    }

    return '';
  }
}

export default GreenPort;
