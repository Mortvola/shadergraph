export type Type = 'float' | 'vec2f' | 'vec3f' | 'vec4f' | 'texture2D' | 'sampler' | 'rgba' | 'string';

export type NodeType =
  'property' | 'texture' | 'SampleTexture' | 'simpleVertex' | 'simpleFrag' | 'display' | 'uv'
  | 'TileAndScroll' | 'Multiply' | 'time';

export interface InputPortInterface {
  node: GraphNodeInterface;

  type: Type;

  name: string;

  edge: GraphEdgeInterface | null;

  offsetX: number;

  offsetY: number;

  getVarname(): string;
};

export interface OutputPortInterface {
  node: GraphNodeInterface;

  type: Type;

  name: string;

  varName: string | null;

  edge: GraphEdgeInterface | null;
  
  offsetX: number;

  offsetY: number;  
};

export interface GraphNodeInterface {
  name: string;
  
  type: NodeType;

  id: number;

  x: number;
  
  y: number;

  setPosition(x: number, y: number): void;
}

export interface OperationNodeInterface extends GraphNodeInterface {
  inputPorts: InputPortInterface[];

  outputPort: OutputPortInterface | null;

  output(): string;
}

export const isOperationNode = (r: unknown): r is OperationNodeInterface => (
  (r as OperationNodeInterface).inputPorts !== undefined
  && (r as OperationNodeInterface).outputPort !== undefined
)

export interface GraphEdgeInterface {  
  output: OutputPortInterface;

  input: InputPortInterface;

  getVarName(): string;
}
