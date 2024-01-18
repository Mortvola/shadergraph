import OutputPort from "./OutputPort";

class RedPort extends OutputPort {
  getVarName(): string {
    if (this.node.getVarName()) {
      return `${this.node.getVarName()}.r`
    }

    return '';
  }
}

export default RedPort;
