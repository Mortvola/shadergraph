import type { GraphNodeDescriptor } from "../GraphDescriptor";
import BinaryOp from "./BinaryOp";

class Divide extends BinaryOp {
  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('Divide', 'Divide', '/', nodeDescriptor?.id)
  }
}

export default Divide;
