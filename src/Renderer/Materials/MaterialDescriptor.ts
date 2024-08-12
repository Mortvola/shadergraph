import ShaderGraph from "../ShaderBuilder/ShaderGraph";
import { GraphNodeInterface, PropertyInterface } from "../ShaderBuilder/Types";
import { ShaderDescriptor } from "../shaders/ShaderDescriptor";

export type MaterialDescriptor = {
  properties?: PropertyInterface[],

  shaderDescriptor?: ShaderDescriptor | number,

  graph?: ShaderGraph

  root?: GraphNodeInterface
}
