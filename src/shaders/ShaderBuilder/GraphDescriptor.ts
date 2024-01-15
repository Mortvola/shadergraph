import { NodeType, Type } from "./Types";

export type GraphPortDescriptor = { graphNodeId: number, port: string };

export type GraphEdgeDescriptor = [GraphPortDescriptor, GraphPortDescriptor];

export type GraphNodeDescriptor = {
  id: number,
  type: NodeType,
}

export type PropertyDescriptor = GraphNodeDescriptor & {
  name: string,
  dataType: Type,
  value: string | number | [number, number],
}

export type GraphStageDescriptor = {
  nodes: (GraphNodeDescriptor | PropertyDescriptor)[],
  edges: GraphEdgeDescriptor[],
}

export type GraphDescriptor = {
  vertex: GraphStageDescriptor,
  fragment: GraphStageDescriptor,
}
