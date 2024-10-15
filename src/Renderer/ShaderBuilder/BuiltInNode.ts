import type { DataType, NodeType } from './GraphDescriptor';
import GraphNode from './GraphNode';

class BuiltIn extends GraphNode {
  name: string;

  property: boolean;

  constructor(type: NodeType, name: string, property: boolean, id?: number) {
    super(type, id)

    this.name = name;
    this.property = property;
  }

  getName(): string {
    return this.name;
  }

  getExpression(editMode: boolean): [string, DataType] {
    return this.getVarName() ?? ['', 'float'];
  }

  output(editMode: boolean): string {
    return '';
  }
}

export default BuiltIn;
