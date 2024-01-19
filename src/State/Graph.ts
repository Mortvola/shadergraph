import { makeObservable, observable, runInAction } from "mobx";
import { GraphEdgeInterface, GraphNodeInterface, InputPortInterface, OutputPortInterface, PropertyInterface } from "../shaders/ShaderBuilder/Types";
import GraphEdge from "../shaders/ShaderBuilder/GraphEdge";
import Display from "../shaders/ShaderBuilder/Nodes/Display";
import { buildGraph, createDescriptor } from "../shaders/ShaderBuilder/ShaderBuilder";
import { MaterialInterface } from "../types";
import { MaterialDescriptor } from "../Materials/MaterialDescriptor";
import Material from "../Materials/Material";
import { CullMode, StoreInterface } from "./types";
import Property from "../shaders/ShaderBuilder/Property";

class Graph {
  nodes: GraphNodeInterface[] = [];

  dragConnector: [number, number][] | null = null;

  edges: GraphEdge[] = [];

  cullMode: CullMode = 'none';

  transparent = false;

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

  private delEdge(edge: GraphEdgeInterface) {
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
          const edge = outputPort.edge;

          if (edge) {
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

  setTransparency(transparent: boolean) {
    runInAction(() => {
      this.transparent = transparent;
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
