import type { DataType, GraphDescriptor, ValueType } from '../ShaderBuilder/GraphDescriptor';

export type ShaderType = 'Line' | 'Trajectory' | 'Decal';

export type ShaderDescriptor = {
  type?: ShaderType;

  color?: number[],

  properties?: { name: string, dataType: DataType, value: ValueType }[],

  graphDescriptor?: GraphDescriptor,
}
