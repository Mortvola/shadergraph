import type ShaderGraph from "../Renderer/ShaderBuilder/ShaderGraph";
import type { GraphEdgeInterface, GraphNodeInterface, InputPortInterface, OutputPortInterface, PropertyInterface } from "../Renderer/ShaderBuilder/Types";

export type CullMode = 'back' | 'none' | 'front';

export interface GraphInterface {
  id: number | null;
  
  name: string;

  changed: boolean;

  graph: ShaderGraph;

  selectedNode: GraphNodeInterface | null;

  dragConnector: [number, number][] | null;
  
  setName(name: string): void;

  selectNode(node: GraphNodeInterface | null): void;

  deleteNode(node: GraphNodeInterface): void;

  setNodePosition(node: GraphNodeInterface, x: number, y: number): void;

  changeNodePosition(node: GraphNodeInterface, deltaX: number, deltaY: number): void;

  deleteEdge(edge: GraphEdgeInterface): void;

  link(outputPort: OutputPortInterface, inputPort: InputPortInterface): void;

  setDragConnector(points: [number, number][] | null): void;

  addProperty(property: PropertyInterface): void;

  deleteProperty(property: PropertyInterface): void;

  applyMaterial(): Promise<void>;

  setCullMode(mode: CullMode): void;

  setTransparency: (transparent: boolean) => void;

  setDepthWriteEnabled: (depthWriteEnabled: boolean) => void;

  setLit: (lit: boolean) => void;

  addNode(node: GraphNodeInterface): void;
}

