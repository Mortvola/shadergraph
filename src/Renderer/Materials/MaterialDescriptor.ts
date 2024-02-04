import { GraphDescriptor } from "../ShaderBuilder/GraphDescriptor";
import { ValueType, DataType } from "../ShaderBuilder/Types";

export type MaterialDescriptor = {
  type: 'Circle' | 'Line' | 'Lit' | 'Trajectory' | 'Billboard';

  cullMode?: 'back' | 'none',

  color?: number[],

  transparent?: boolean,

  depthWriteEnabled?: boolean,

  lit?: boolean,

  properties?: { name: string, dataType: DataType, value: ValueType }[],

  graph?: GraphDescriptor,
}
