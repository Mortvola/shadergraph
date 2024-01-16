import { makeObservable, observable, runInAction } from "mobx";
import { GraphNodeInterface, InputPortInterface, OutputPortInterface } from "../shaders/ShaderBuilder/Types";
import GraphEdge from "../shaders/ShaderBuilder/GraphEdge";
import Display from "../shaders/ShaderBuilder/Nodes/Display";
import { buildGraph, createDescriptor } from "../shaders/ShaderBuilder/ShaderBuilder";
import { GraphDescriptor } from "../shaders/ShaderBuilder/GraphDescriptor";

class Graph {
  nodes: GraphNodeInterface[] = [];

  dragConnector: [number, number][] | null = null;

  edges: GraphEdge[] = [];

  changed = false;

  constructor(descriptor?: GraphDescriptor) {
    if (descriptor) {
      const { nodes, edges } = buildGraph(descriptor.fragment);

      this.nodes = nodes;
      this.edges = edges;
    }
    else {
      this.nodes = [
        new Display(),
      ];  
    }

    makeObservable(this, {
      nodes: observable,
    });
  }

  setDragConnector(points: [number, number][] | null) {
    this.dragConnector = points;
  }

  link(outputPort: OutputPortInterface, inputPort: InputPortInterface) {
    const edge = new GraphEdge(outputPort, inputPort);

    this.edges.push(edge);

    this.changed = true;
  }

  addNode(node: GraphNodeInterface) {
    runInAction(() => {
      this.nodes = this.nodes.concat(node);
      this.changed = true;
    })
  }

  setNodePosition(node: GraphNodeInterface, x: number, y: number) {
    runInAction(() => {
      node.x = x;
      node.y = y;
      this.changed = true;
    })
  }

  createDescriptor(): GraphDescriptor {
    return createDescriptor(this.nodes, this.edges)
  }
}

export default Graph;
