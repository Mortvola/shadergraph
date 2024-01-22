import { makeObservable, observable, runInAction } from "mobx";
import { GraphEdgeInterface, GraphNodeInterface, InputPortInterface, OutputPortInterface, PropertyInterface } from "../Renderer/ShaderBuilder/Types";
import GraphEdge from "../Renderer/ShaderBuilder/GraphEdge";
import Display from "../Renderer/ShaderBuilder/Nodes/Display";
import { buildGraph, createDescriptor } from "../Renderer/ShaderBuilder/ShaderBuilder";
import { MaterialInterface } from "../Renderer/types";
import { MaterialDescriptor } from "../Renderer/Materials/MaterialDescriptor";
import Material from "../Renderer/Materials/Material";
import { CullMode, StoreInterface } from "./types";
import Property from "../Renderer/ShaderBuilder/Property";

class Graph {
  nodes: GraphNodeInterface[] = [];

  dragConnector: [number, number][] | null = null;

  edges: GraphEdge[] = [];

  defaultEdges: InputPortInterface[] = [];

  cullMode: CullMode = 'none';

  transparent = false;

  depthWriteEnabled = true;

  properties: Property[] = [];

  changed = false;

  selectedNode: GraphNodeInterface | null = null;

  store: StoreInterface;

  constructor(store: StoreInterface, descriptor?: MaterialDescriptor) {
    this.store = store;

    if (descriptor) {
      if (descriptor.properties) {
        this.properties = descriptor.properties.map((p) => (
          new Property(p.name, p.dataType, p.value)
        ))
      }

      if (descriptor.graph) {
        const graph = buildGraph(descriptor.graph, this.properties);

        if (graph.fragment) {
          this.nodes = graph.fragment.nodes;
          this.edges = graph.fragment.edges;  
        }  
      }

      this.cullMode = descriptor.cullMode ?? 'front';

      this.transparent = descriptor.transparent ?? false;

      this.depthWriteEnabled = descriptor.depthWriteEnabled ?? true;
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
      depthWriteEnabled: observable,
      cullMode: observable,
      properties: observable,
    });
  }

  setDragConnector(points: [number, number][] | null) {
    this.dragConnector = points;
  }

  addProperty(property: PropertyInterface) {
    runInAction(() => {
      this.properties.push(property);
      this.changed = true;  
    })
  }

  deleteProperty(property: PropertyInterface) {
    const index = this.properties.findIndex((p) => p === property);

    if (index !== -1) {
      runInAction(() => {
        this.properties = [
          ...this.properties.slice(0, index),
          ...this.properties.slice(index + 1),
        ];

        this.changed = true;  
      })
    }
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
      node.position!.x = x;
      node.position!.y = y;
      this.changed = true;
    })
  }

  selectNode(node: GraphNodeInterface | null) {
    runInAction(() => {
      this.selectedNode = node;
    })
  }

  private delEdge(edge: GraphEdgeInterface) {
    let index = edge.output.edges.findIndex((e) => e === edge);

    if (index !== -1) {
      edge.output.edges = [
        ...edge.output.edges.slice(0, index),
        ...edge.output.edges.slice(index + 1),
      ];
    }

    edge.input.edge = null;

    // Find the edge in the edge list and remove eit
    index = this.edges.findIndex((e) => e === edge);
    
    if (index !== -1) {
      this.edges = [
        ...this.edges.slice(0, index),
        ...this.edges.slice(index + 1),
      ];

      this.changed = true;
    }
  }

  deleteEdge(edge: GraphEdgeInterface) {
    runInAction(() => {
      this.delEdge(edge);
    })
  }

  deleteNode(node: GraphNodeInterface) {
    const index = this.nodes.findIndex((n) => n === node);
    
    if (index !== -1) {
      runInAction(() => {
        const node = this.nodes[index];

        // Delete any connected input edges
        for (const inputPort of node.inputPorts) {
          const edge = inputPort.edge;

          if (edge) {
            this.delEdge(edge);
          }
        }

        // Delete any connected output edges
        for (const outputPort of node.outputPort) {
          for (const edge of outputPort.edges) {
            this.delEdge(edge);
          }
        }

        this.nodes = [
          ...this.nodes.slice(0, index),
          ...this.nodes.slice(index + 1),
        ];

        this.changed = true;    
      })
    }
  }

  setTransparency = (transparent: boolean) => {
    runInAction(() => {
      this.transparent = transparent;
      this.changed = true;
      this.store.applyChanges()
    })
  }

  setDepthWriteEnabled = (depthWriteEnabled: boolean) => {
    runInAction(() => {
      this.depthWriteEnabled = depthWriteEnabled;
      this.changed = true;
      this.store.applyChanges()
    })
  }

  setCullMode(mode: CullMode): void {
    runInAction(() => {
      this.cullMode = mode;
      this.changed = true;
      this.store.applyChanges()
    })
  }

  createMaterialDescriptor(): MaterialDescriptor {
    const materialDescriptor: MaterialDescriptor = {
      type: 'Lit',
      cullMode: this.cullMode === 'front' ? undefined : this.cullMode,
      transparent: this.transparent,
      depthWriteEnabled: this.depthWriteEnabled,
      
      properties: this.properties.map((p) => ({
        name: p.name,
        dataType: p.value.dataType,
        value: p.value.value,
      })),

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
