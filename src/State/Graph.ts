import { makeObservable, observable, runInAction } from "mobx";
import { GraphEdgeInterface, GraphNodeInterface, InputPortInterface, OutputPortInterface, PropertyInterface } from "../Renderer/ShaderBuilder/Types";
import GraphEdge from "../Renderer/ShaderBuilder/GraphEdge";
import Display from "../Renderer/ShaderBuilder/Nodes/Display";
import { buildGraph, createDescriptor } from "../Renderer/ShaderBuilder/ShaderBuilder";
import { MaterialInterface } from "../Renderer/types";
import { MaterialDescriptor } from "../Renderer/Materials/MaterialDescriptor";
import Material from "../Renderer/Materials/Material";
import { CullMode, GraphInterface, StoreInterface } from "./types";
import Property from "../Renderer/ShaderBuilder/Property";

let nextShaderName = 0;

const getNextShaderName = () => {
  const name = `shader${nextShaderName}`;
  nextShaderName += 1;

  return name;
}

class Graph implements GraphInterface {
  id: number | null = null;

  name = '';
  
  nodes: GraphNodeInterface[] = [];

  dragConnector: [number, number][] | null = null;

  edges: GraphEdge[] = [];

  defaultEdges: InputPortInterface[] = [];

  cullMode: CullMode = 'none';

  transparent = false;

  depthWriteEnabled = true;

  lit = false;

  properties: PropertyInterface[] = [];

  changed = false;

  selectedNode: GraphNodeInterface | null = null;

  store: StoreInterface;

  constructor(store: StoreInterface, id?: number, name?: string, descriptor?: MaterialDescriptor) {
    this.store = store;

    this.id = id ?? null;
    
    this.name = name ?? getNextShaderName();

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

      this.lit = descriptor.lit ?? false;
    }

    if (this.nodes.length === 0) {
      this.nodes = [
        new Display(),
      ];

      this.edges = [];
    }

    makeObservable(this, {
      name: observable,
      nodes: observable,
      selectedNode: observable,
      transparent: observable,
      depthWriteEnabled: observable,
      lit: observable,
      cullMode: observable,
      properties: observable,
    });
  }

  setName(name: string): void {
    runInAction(() => {
      this.name = name;
    })
  }

  setDragConnector(points: [number, number][] | null): void {
    this.dragConnector = points;
  }

  addProperty(property: PropertyInterface): void {
    runInAction(() => {
      this.properties.push(property);
      this.changed = true;  
    })
  }

  deleteProperty(property: PropertyInterface): void {
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

  link(outputPort: OutputPortInterface, inputPort: InputPortInterface): void {
    const edge = new GraphEdge(outputPort, inputPort);

    this.edges.push(edge);

    this.changed = true;

    this.store.applyMaterial()
  }

  addNode(node: GraphNodeInterface): void {
    runInAction(() => {
      this.nodes = this.nodes.concat(node);
      this.changed = true;
    })
  }

  setNodePosition(node: GraphNodeInterface, x: number, y: number): void {
    runInAction(() => {
      node.position!.x = x;
      node.position!.y = y;
      this.changed = true;
    })
  }

  changeNodePosition(node: GraphNodeInterface, deltaX: number, deltaY: number): void {
    runInAction(() => {
      node.position!.x += deltaX;
      node.position!.y += deltaY;
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

  deleteEdge(edge: GraphEdgeInterface): void {
    runInAction(() => {
      this.delEdge(edge);
    })
  }

  deleteNode(node: GraphNodeInterface): void {
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

  setTransparency = (transparent: boolean): void => {
    runInAction(() => {
      this.transparent = transparent;
      this.changed = true;
      this.store.applyMaterial()
    })
  }

  setDepthWriteEnabled = (depthWriteEnabled: boolean): void => {
    runInAction(() => {
      this.depthWriteEnabled = depthWriteEnabled;
      this.changed = true;
      this.store.applyMaterial()
    })
  }

  setLit = (lit: boolean): void => {
    runInAction(() => {
      this.lit = lit;
      this.changed = true;
      this.store.applyMaterial()
    })
  }

  setCullMode(mode: CullMode): void {
    runInAction(() => {
      this.cullMode = mode;
      this.changed = true;
      this.store.applyMaterial()
    })
  }

  createMaterialDescriptor(): MaterialDescriptor {
    const materialDescriptor: MaterialDescriptor = {
      type: 'Lit',
      cullMode: this.cullMode === 'front' ? undefined : this.cullMode,
      transparent: this.transparent,
      depthWriteEnabled: this.depthWriteEnabled,
      lit: this.lit,
      
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
    const materialDescriptor = this.createMaterialDescriptor();

    return await Material.create('Mesh', [], materialDescriptor);
  }
}

export default Graph;
