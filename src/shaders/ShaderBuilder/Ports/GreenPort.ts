import OutputPort from "./OutputPort";

class GreenPort extends OutputPort {
  getVarName(): string {
    if (this.node.outputVarName) {
      return `${this.node.outputVarName}.g`
    }

    return '';
  }
}

export default GreenPort;
