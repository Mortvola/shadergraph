import { makeObservable, observable, runInAction } from "mobx";
import { GraphEdgeInterface, GraphNodeInterface, InputPortInterface, OperationNodeInterface, OutputPortInterface, isOperationNode } from "../shaders/ShaderBuilder/Types";
import GraphEdge from "../shaders/ShaderBuilder/GraphEdge";
import Display from "../shaders/ShaderBuilder/Nodes/Display";
import { buildGraph, createDescriptor } from "../shaders/ShaderBuilder/ShaderBuilder";
import { GraphDescriptor } from "../shaders/ShaderBuilder/GraphDescriptor";
import { MaterialInterface } from "../types";
import { MaterialDescriptor } from "../Materials/MaterialDescriptor";
import Material from "../Materials/Material";
import { StoreInterface } from "./types";

class Graph {
  nodes: GraphNodeInterface[] = [];

  dragConnector: [number, number][] | null = null;

  edges: GraphEdge[] = [];

  cullMode: 'back' | 'none' = 'none';

  transparent = false;

  changed = false;

  selectedNode: GraphNodeInterface | null = null;

  store: StoreInterface;

  constructor(store: StoreInterface, descriptor?: MaterialDescriptor) {
    this.store = store;

    if (descriptor) {
      if (descriptor.graph) {
        const graph = buildGraph(descriptor.graph);

        if (graph.fragment) {
          this.nodes = graph.fragment.nodes;
          this.edges = graph.fragment.edges;  
        }  
      }

      this.cullMode = descriptor.cullMode ?? 'back';

      this.transparent = descriptor.transparent ?? false;
    }

    if (this.nodes.length === 0) {
      this.nodes = [
        new Display(),
      ];

      this.edges = [];
    }

    makeObservable(this, {
      nodes: observable,
      selectedNode: observable,
      transparent: observable,
    });
  }

  setDragConnector(points: [number, number][] | null) {
    this.dragConnector = points;
  }

  link(outputPort: OutputPortInterface, inputPort: InputPortInterface) {
    const edge = new GraphEdge(outputPort, inputPort);

    this.edges.push(edge);

    this.changed = true;

    this.store.applyChanges()
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

  setTransparency(transparent: boolean) {
    runInAction(() => {
      this.transparent = transparent;
      this.changed = true;
      this.store.applyChanges()
    })
  }

  createMaterialDescriptor(): MaterialDescriptor {
    const materialDescriptor: MaterialDescriptor = {
      type: 'Lit',
      cullMode: this.cullMode,
      transparent: this.transparent,
      
      graph: createDescriptor(this.nodes, this.edges),
    }

    return materialDescriptor;
  }

  async generateMaterial(): Promise<MaterialInterface> {
    // const shaderGraph = new ShaderGraph();
    // shaderGraph.fragment = new StageGraph();
    // shaderGraph.fragment.nodes = this.nodes;
    // shaderGraph.fragment.edges = this.edges;

    const materialDescriptor = this.createMaterialDescriptor();

    return await Material.create(materialDescriptor);
  }
}

export default Graph;
