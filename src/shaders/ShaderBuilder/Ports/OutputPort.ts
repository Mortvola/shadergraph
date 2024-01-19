import { OutputPortInterface } from "../Types"
import Port from "./Port";

class OutputPort extends Port implements OutputPortInterface {
  getVarName(): string {
    return this.node.getVarName() ?? '';
  }
}

export default OutputPort;

