export type DataType = 'float' | 'vec2f' | 'vec3f' | 'vec4f' | 'texture2D' | 'sampler' | 'rgba' | 'string';

export type NodeType =
  'property' | 'value'
  | 'uv' | 'time'  | 'time'
  | 'TileAndScroll' | 'Multiply' | 'SampleTexture' | 'display';

export type SamplerDescriptor = {};

export type ValueType =
  string
  | number 
  | [number, number]
  | [number, number, number]
  | [number, number, number, number]
  | SamplerDescriptor;

export interface InputPortInterface {
  node: GraphNodeInterface;

  type: DataType;

  name: string;

  edge: GraphEdgeInterface | null;

  offsetX: number;

  offsetY: number;

  getVarname(): string;
};

export interface OutputPortInterface {
  node: GraphNodeInterface;

  type: DataType;

  name: string;

  edge: GraphEdgeInterface | null;
  
  offsetX: number;

  offsetY: number;

  getVarName(): string;
};

export interface GraphNodeInterface {
  type: NodeType;

  id: number;

  inputPorts: InputPortInterface[];

  outputPort: OutputPortInterface[];

  getVarName(): string | null;

  setVarName(name: string): void;

  x: number;
  
  y: number;

  priority: number | null;

  getName(): string;

  output(): string;

  setPosition(x: number, y: number): void;
}

export interface PropertyNodeInterface extends GraphNodeInterface {
  property: PropertyInterface;

  outputPort: OutputPortInterface[];

  readonly: boolean;
}

export interface ValueNodeInterface extends GraphNodeInterface {
  value: ValueInterface;
}

export interface StagePropertyInterface {
  property: PropertyInterface;
}

export const isPropertyNode = (r: unknown): r is PropertyNodeInterface => (
  (r as PropertyNodeInterface).property !== undefined
)

export const isValueNode = (r: unknown): r is ValueNodeInterface => (
  (r as ValueNodeInterface).value !== undefined
)

export interface GraphEdgeInterface {  
  output: OutputPortInterface;

  input: InputPortInterface;

  getVarName(): string;

  setVarName(name: string): void;
}

export interface ValueInterface {
  dataType: DataType;

  value: ValueType;

  getValueString(): string;
}

export interface PropertyInterface {
  name: string;

  value: ValueInterface;

  builtin: boolean;
}