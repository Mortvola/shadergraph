import { makeObservable, observable, runInAction } from "mobx";
import { GraphEdgeInterface, GraphNodeInterface, InputPortInterface, OperationNodeInterface, OutputPortInterface, isOperationNode } from "../shaders/ShaderBuilder/Types";
import GraphEdge from "../shaders/ShaderBuilder/GraphEdge";
import Display from "../shaders/ShaderBuilder/Nodes/Display";
import { buildGraph, createDescriptor, generateShaderCode } from "../shaders/ShaderBuilder/ShaderBuilder";
import { GraphDescriptor } from "../shaders/ShaderBuilder/GraphDescriptor";
import ShaderGraph from "../shaders/ShaderBuilder/ShaderGraph";
import StageGraph from "../shaders/ShaderBuilder/StageGraph";
import { MaterialInterface, PipelineInterface } from "../types";
import { MaterialDescriptor } from "../Materials/MaterialDescriptor";
import { pipelineManager } from "../Pipelines/PipelineManager";
import Material from "../Materials/Material";

class Graph {
  nodes: GraphNodeInterface[] = [];

  dragConnector: [number, number][] | null = null;

  edges: GraphEdge[] = [];

  changed = false;

  selectedNode: GraphNodeInterface | null = null;

  constructor(descriptor?: GraphDescriptor) {
    if (descriptor) {
      const graph = buildGraph(descriptor);

      if (graph.fragment) {
        this.nodes = graph.fragment.nodes;
        this.edges = graph.fragment.edges;  
      }
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

  async generateMaterial(): Promise<MaterialInterface> {
    // const shaderGraph = new ShaderGraph();
    // shaderGraph.fragment = new StageGraph();
    // shaderGraph.fragment.nodes = this.nodes;
    // shaderGraph.fragment.edges = this.edges;

    const materialDescriptor: MaterialDescriptor = {
      type: 'Lit',
      cullMode: 'none',
      texture: {
        url: './textures/stars.png',
        scale: [1, 5],
        offset: [0, 0.1],
      },

      graph: createDescriptor(this.nodes, this.edges),
    }

    return await Material.create(materialDescriptor);
  }
}

export default Graph;
