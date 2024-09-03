import type { GraphNodeDescriptor } from "../GraphDescriptor";
import BinaryOp from "./BinaryOp";

class Subtract extends BinaryOp {
  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('Subtract', 'Subtract', '-', nodeDescriptor?.id)
  }
}

export default Subtract;
