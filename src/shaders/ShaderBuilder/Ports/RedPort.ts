import OutputPort from "./OutputPort";

class RedPort extends OutputPort {
  getVarName(): string {
    if (this.node.outputVarName) {
      return `${this.node.outputVarName}.r`
    }

    return '';
  }
}

export default RedPort;
