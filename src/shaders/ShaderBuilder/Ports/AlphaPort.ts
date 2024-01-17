import OutputPort from "./OutputPort";

class AlphaPort extends OutputPort {
  getVarName(): string {
    if (this.node.outputVarName) {
      return `${this.node.outputVarName}.a`
    }

    return '';
  }
}

export default AlphaPort;
