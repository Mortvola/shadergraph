import { makeObservable, observable, runInAction } from "mobx";
import { GraphEdgeInterface, GraphNodeInterface, InputPortInterface, OperationNodeInterface, OutputPortInterface, isOperationNode } from "../shaders/ShaderBuilder/Types";
import GraphEdge from "../shaders/ShaderBuilder/GraphEdge";
import Display from "../shaders/ShaderBuilder/Nodes/Display";
import { buildGraph, createDescriptor } from "../shaders/ShaderBuilder/ShaderBuilder";
import { GraphDescriptor } from "../shaders/ShaderBuilder/GraphDescriptor";

class Graph {
  nodes: GraphNodeInterface[] = [];

  dragConnector: [number, number][] | null = null;

  edges: GraphEdge[] = [];

  changed = false;

  selectedNode: GraphNodeInterface | null = null;

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
      selectedNode: observable,
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

  selectNode(node: GraphNodeInterface | null) {
    runInAction(() => {
      this.selectedNode = node;
    })
  }

  deleteEdge(edge: GraphEdgeInterface) {
    edge.output.edge = null;
    edge.input.edge = null;

    const index = this.edges.findIndex((e) => e === edge);
    
    if (index !== -1) {
      this.edges = [
        ...this.edges.slice(0, index),
        ...this.edges.slice(index + 1),
      ];

      this.changed = true;
    }
  }

  deleteNode(node: GraphNodeInterface) {
    const index = this.nodes.findIndex((n) => n === node);
    
    if (index !== -1) {
      runInAction(() => {
        const node = this.nodes[index];

        // Delete any connected edges
        if (isOperationNode(node)) {
          for (const inputPort of node.inputPorts) {
            const edge = inputPort.edge;

            if (edge) {
              this.deleteEdge(edge);
            }
          }
        }

        const edge = (node as OperationNodeInterface).outputPort?.edge;

        if (edge) {
          this.deleteEdge(edge);
        }

        this.nodes = [
          ...this.nodes.slice(0, index),
          ...this.nodes.slice(index + 1),
        ];

        this.changed = true;    
      })
    }
  }
}

export default Graph;
