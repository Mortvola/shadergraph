import { InputPortInterface } from "../Types";
import Port from "./Port";

class InputPort extends Port implements InputPortInterface {
  getVarName(): string {
    return this.edge?.getVarName() ?? '';
  }
}

export default InputPort;
