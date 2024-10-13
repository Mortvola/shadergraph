import type { DataType, GraphNodeDescriptor, NodeType, ValueType } from "./GraphDescriptor";
import type GraphNotification from "./GraphNotification";

export interface PortInterface {
  node: GraphNodeInterface;

  dataType: DataType;

  name: string;

  offsetX: number;

  offsetY: number;
}

export interface InputPortInterface extends PortInterface {
  edge: GraphEdgeInterface | null;

  value?: ValueInterface;

  constantName: string; // used for temporary var names for the "constants" attached to an input port
  
  getVarName(): [string, DataType];

  getValue(editMode: boolean): [string, DataType];

  getDataType(): DataType;

  connected(): boolean;

  unlink(): void;
};

export const isInputPort = (r: unknown): r is InputPortInterface => (
  (r as InputPortInterface).edge !== undefined
)

export interface OutputPortInterface extends PortInterface {
  edges: GraphEdgeInterface[];
  
  getVarName(): [string, DataType];

  getValue(editMode: boolean): [string, DataType];

  getDataType(): DataType;

  connected(): boolean;

  unlink(edge: GraphEdgeInterface): void;
};

export interface GraphNodeInterface {
  type: NodeType;

  id: number;

  inputPorts: InputPortInterface[];

  outputPort: OutputPortInterface[];

  settings?: unknown;

  createDescriptor(): GraphNodeDescriptor

  getDataType(): DataType;

  getVarName(): [string, DataType];

  setVarName(name: string | null): void;

  getValue(editMode: boolean): [string, DataType];

  position: { x: number, y: number };

  priority: number | null;

  getName(): string;

  output(editMode: boolean): string;

  setPosition(x: number, y: number): void;

  notify(notification?: GraphNotification): void;
}

export interface PropertyNodeInterface extends GraphNodeInterface {
  property: PropertyInterface;

  outputPort: OutputPortInterface[];

  readonly: boolean;
}

export interface ValueNodeInterface extends GraphNodeInterface {
  value: ValueInterface;
}

export const isPropertyNode = (r: unknown): r is PropertyNodeInterface => (
  (r as PropertyNodeInterface).type === 'property'
  && (r as PropertyNodeInterface).property !== undefined
)

export const isValueNode = (r: unknown): r is ValueNodeInterface => (
  (r as ValueNodeInterface).value !== undefined
)

export interface GraphEdgeInterface {  
  output: OutputPortInterface;

  input: InputPortInterface;

  getVarName(): [string, DataType];

  getValue(editMode: boolean): [string, DataType];

  getDataType(): DataType;

  unlink(): void;
}

export interface ValueInterface {
  dataType: DataType;

  value: ValueType;

  getValueString(): [string, DataType];
}

export interface PropertyInterface {
  name: string;

  value: ValueInterface;

  builtin: boolean;
}

export const getLength = (dataType: DataType) => {
  switch (dataType) {
    case 'float':
      return 1;
    case 'vec2f':
      return 2;
    case 'vec3f':
      return 3;
    case 'vec4f':
    case 'color':
      return 4;
  }

  return 0;
}

export const convertType = (type: string) => {
  switch (type) {
    case 'float':
      return '1';

    case 'vec2f':
      return '2';

    case 'vec3f':
      return '3';
      
    case 'vec4f':
    case 'color':
      return '4';

    case 'texture2D':
      return 'T2';

    case 'sampler':
      return 'S';

    default:
      return type;
  }
}

export enum CullMode {
  Back = 'back',
  None = 'none',
  Front = 'front'
}

