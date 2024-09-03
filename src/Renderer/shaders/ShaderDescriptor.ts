import type { DataType, GraphDescriptor, ValueType } from "../ShaderBuilder/GraphDescriptor";

export type ShaderType = 'Line' | 'Trajectory' | 'Decal';

export type ShaderDescriptor = {
  type?: ShaderType;

  cullMode?: 'back' | 'none',

  color?: number[],

  transparent?: boolean,

  depthWriteEnabled?: boolean,

  lit?: boolean,

  decal?: boolean,

  properties?: { name: string, dataType: DataType, value: ValueType }[],

  graphDescriptor?: GraphDescriptor,
}
