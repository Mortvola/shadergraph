import OutputPort from "./OutputPort";

class AlphaPort extends OutputPort {
  getVarName(): string {
    if (this.node.getVarName()) {
      return `${this.node.getVarName()}.a`
    }

    return '';
  }
}

export default AlphaPort;
