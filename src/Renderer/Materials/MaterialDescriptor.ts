import type ShaderGraph from "../ShaderBuilder/ShaderGraph";
import type { GraphNodeInterface, PropertyInterface } from "../ShaderBuilder/Types";
import type { ShaderDescriptor } from "../shaders/ShaderDescriptor";

export type MaterialDescriptor = {
  properties?: PropertyInterface[],

  shaderId?: number,

  shaderDescriptor?: ShaderDescriptor,

  graph?: ShaderGraph

  root?: GraphNodeInterface
}
