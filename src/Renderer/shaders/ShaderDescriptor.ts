import { type CullMode } from "../ShaderBuilder/Types";
import type { DataType, GraphDescriptor, ValueType } from "../ShaderBuilder/GraphDescriptor";

export type ShaderType = 'Line' | 'Trajectory' | 'Decal';

export type ShaderDescriptor = {
  type?: ShaderType;

  cullMode?: CullMode,

  color?: number[],

  transparent?: boolean,

  depthWriteEnabled?: boolean,

  lit?: boolean,

  decal?: boolean,

  properties?: { name: string, dataType: DataType, value: ValueType }[],

  graphDescriptor?: GraphDescriptor,
}
