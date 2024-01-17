export type Type = 'float' | 'vec2f' | 'vec3f' | 'vec4f' | 'texture2D' | 'sampler' | 'rgba' | 'string';

export type NodeType =
  'property' | 'texture' | 'SampleTexture' | 'simpleVertex' | 'simpleFrag' | 'display' | 'uv'
  | 'TileAndScroll' | 'Multiply' | 'time';

export type PropertyType = string | number | [number, number] | [number, number, number] | [number, number, number, number];

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

  edge: GraphEdgeInterface | null;
  
  offsetX: number;

  offsetY: number;

  getVarName(): string;
};

export interface GraphNodeInterface {
  name: string;

  type: NodeType;

  id: number;

  inputPorts: InputPortInterface[];

  outputPort: OutputPortInterface[];

  outputVarName: string | null;

  x: number;
  
  y: number;

  priority: number | null;

  output(): string;

  setPosition(x: number, y: number): void;
}

export interface PropertyNodeInterface extends GraphNodeInterface {
  dataType: Type;

  value: PropertyType;

  outputPort: OutputPortInterface[];

  readonly: boolean;
}

export interface StagePropertyInterface {
  type: Type;

  value: PropertyType;
}

export const isPropertyNode = (r: unknown): r is PropertyNodeInterface => (
  (r as PropertyNodeInterface).dataType !== undefined
  && (r as PropertyNodeInterface).value !== undefined
)

export interface GraphEdgeInterface {  
  output: OutputPortInterface;

  input: InputPortInterface;

  getVarName(): string;

  setVarName(name: string): void;
}
