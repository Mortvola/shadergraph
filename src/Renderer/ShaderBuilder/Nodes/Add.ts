import type { GraphNodeDescriptor } from '../GraphDescriptor';
import BinaryOp from './BinaryOp';

class Add extends BinaryOp {
  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('Add', 'Add', '+', nodeDescriptor?.id)
  }
}

export default Add;
