export type Type = 'float' | 'vec2f' | 'vec3f' | 'vec4f' | 'texture2D' | 'sampler' | 'rgba' | 'string';

export type NodeType =
  'property' | 'texture' | 'SampleTexture' | 'simpleVertex' | 'simpleFrag' | 'display' | 'uv'
  | 'TileAndScroll' | 'Multiply' | 'time';

export interface InputPortInterface {
  node: GraphNodeInterface;

  type: Type;

  name: string;

  edge: GraphEdgeInterface | null;

  getVarname(): string;
};

export interface OutputPortInterface {
  node: GraphNodeInterface;

  type: Type;

  name: string;

  varName: string | null;

  edge: GraphEdgeInterface | null;
};

export interface GraphNodeInterface {
  type: NodeType;

  id: number;
}

export interface OperationNodeInterface extends GraphNodeInterface {
  inputPorts: InputPortInterface[];

  outputPort: OutputPortInterface | null;

  output(): string;
}

export interface GraphEdgeInterface {  
  output: OutputPortInterface;

  input: InputPortInterface;

  getVarName(): string;
}
