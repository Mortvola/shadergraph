export type DataType = 'float' | 'vec2f' | 'vec3f' | 'vec4f' | 'texture2D' | 'sampler' | 'rgba' | 'string' | 'uv' | 'color';

export type NodeType =
  'property' | 'value'
  | 'uv' | 'UV' | 'time' | 'Time'
  | 'Add' | 'Clamp' | 'Combine' | 'display' | 'Display' | 'Distance' | 'Divide' | 'Fraction' | 'FWidth' | 'Inverse' | 'Lerp' | 'Max' | 'Min' | 'Multiply' | 'Power'
  | 'SampleTexture' | 'Split' | 'Subtract' | 'Step' | 'TileAndScroll'
  | 'PhongShading' | 'TextureSize' | 'Twirl' | 'VertexColor' | 'Voronoi'
  | 'Preview';

export type SamplerDescriptor = object;

export type ValueType =
  string
  | number 
  | [number, number]
  | [number, number, number]
  | [number, number, number, number]
  | SamplerDescriptor
  | null;

export type GraphPortDescriptor = { id: number, port: string };

export type GraphEdgeDescriptor = [GraphPortDescriptor, GraphPortDescriptor];

export type PortValueDescriptor = {
  port: string,
  value: ValueType,
}

export type GraphNodeDescriptor = {
  x?: number,
  y?: number,
  id: number,
  type: NodeType,
  portValues?: PortValueDescriptor[],
  settings?: Record<string, unknown>,
}

export type PropertyDescriptor = GraphNodeDescriptor & {
  name: string,
}

export type ValueDescriptor = GraphNodeDescriptor & {
  dataType: DataType,
  value: ValueType,
}

export type NodeDescriptor = GraphNodeDescriptor | PropertyDescriptor | ValueDescriptor;

export type GraphStageDescriptor = {
  nodes: NodeDescriptor[],
  edges: GraphEdgeDescriptor[],
}

export type GraphDescriptor = {
  vertex: GraphStageDescriptor,
  fragment: GraphStageDescriptor,
}
