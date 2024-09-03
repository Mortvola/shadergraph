import type { GraphNodeDescriptor } from "../GraphDescriptor";
import BinaryOp from "./BinaryOp";

class Multiply extends BinaryOp {
  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('Multiply', 'Multiply', '*', nodeDescriptor?.id)
  }
}

export default Multiply;
