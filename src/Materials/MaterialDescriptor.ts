import { GraphDescriptor } from "../shaders/ShaderBuilder/GraphDescriptor";
import { PropertyType, Type } from "../shaders/ShaderBuilder/Types";

export type TextureDescriptor = {
  url: string,

  scale?: [number, number],

  offset?: [number, number],
}

export type MaterialDescriptor = {
  type: 'Circle' | 'Line' | 'Lit' | 'Trajectory';

  cullMode?: 'back' | 'none',

  color?: number[],

  transparent?: boolean,

  properties?: { name: string, dataType: Type, value: PropertyType }[],

  graph?: GraphDescriptor,
}
