import { makeObservable, observable, runInAction } from "mobx";
import { GraphEdgeInterface, GraphNodeInterface, InputPortInterface, OutputPortInterface, PropertyInterface } from "../Renderer/ShaderBuilder/Types";
import GraphEdge from "../Renderer/ShaderBuilder/GraphEdge";
import Display from "../Renderer/ShaderBuilder/Nodes/Display";
import { MaterialInterface } from "../Renderer/types";
import { ShaderDescriptor } from "../Renderer/shaders/ShaderDescriptor";
import Material from "../Renderer/Materials/Material";
import { CullMode, GraphInterface, StoreInterface } from "./types";
import ShaderGraph from "../Renderer/ShaderBuilder/ShaderGraph";

let nextShaderName = 0;

const getNextShaderName = () => {
  const name = `shader${nextShaderName}`;
  nextShaderName += 1;

  return name;
}

class Graph implements GraphInterface {
  id: number | null = null;

  name = '';
  
  graph: ShaderGraph;

  dragConnector: [number, number][] | null = null;

  changed = false;

  selectedNode: GraphNodeInterface | null = null;

  store: StoreInterface;

  constructor(store: StoreInterface, id?: number, name?: string, descriptor?: ShaderDescriptor) {
    this.store = store;

    this.id = id ?? null;
    
    this.name = name ?? getNextShaderName();

    this.graph = new ShaderGraph(descriptor, true);

    if (this.graph.fragment.nodes.length === 0) {
      this.graph.fragment.nodes = [
        new Display(),
      ];
    }

    makeObservable(this, {
      name: observable,
      selectedNode: observable,
    });

    makeObservable(this.graph, {
      lit: observable,
      cullMode: observable,
      transparent: observable,
      depthWriteEnabled: observable,
      properties: observable,
    })

    makeObservable(this.graph.fragment, {
      nodes: observable,
    })
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
      this.graph.properties.push(property);
      this.changed = true;  
    })
  }

  deleteProperty(property: PropertyInterface): void {
    const index = this.graph.properties.findIndex((p) => p === property);

    if (index !== -1) {
      runInAction(() => {
        this.graph.properties = [
          ...this.graph.properties.slice(0, index),
          ...this.graph.properties.slice(index + 1),
        ];

        this.changed = true;  
      })
    }
  }

  link(outputPort: OutputPortInterface, inputPort: InputPortInterface): void {
    const edge = new GraphEdge(outputPort, inputPort);

    this.graph.fragment.edges.push(edge);

    this.changed = true;

    this.store.applyMaterial()
  }

  addNode(node: GraphNodeInterface): void {
    runInAction(() => {
      this.graph.fragment.nodes = this.graph.fragment.nodes.concat(node);
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
    index = this.graph.fragment.edges.findIndex((e) => e === edge);
    
    if (index !== -1) {
      this.graph.fragment.edges = [
        ...this.graph.fragment.edges.slice(0, index),
        ...this.graph.fragment.edges.slice(index + 1),
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
    const index = this.graph.fragment.nodes.findIndex((n) => n === node);
    
    if (index !== -1) {
      runInAction(() => {
        const node = this.graph.fragment.nodes[index];

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

        this.graph.fragment.nodes = [
          ...this.graph.fragment.nodes.slice(0, index),
          ...this.graph.fragment.nodes.slice(index + 1),
        ];

        this.changed = true;    
      })
    }
  }

  setTransparency = (transparent: boolean): void => {
    runInAction(() => {
      this.graph.transparent = transparent;
      this.changed = true;
      this.store.applyMaterial()
    })
  }

  setDepthWriteEnabled = (depthWriteEnabled: boolean): void => {
    runInAction(() => {
      this.graph.depthWriteEnabled = depthWriteEnabled;
      this.changed = true;
      this.store.applyMaterial()
    })
  }

  setLit = (lit: boolean): void => {
    runInAction(() => {
      this.graph.lit = lit;
      this.changed = true;
      this.store.applyMaterial()
    })
  }

  setCullMode(mode: CullMode): void {
    runInAction(() => {
      this.graph.cullMode = mode;
      this.changed = true;
      this.store.applyMaterial()
    })
  }

  async generateMaterial(): Promise<MaterialInterface> {
    const shaderDescriptor = this.graph.createShaderDescriptor();

    return await Material.create('Mesh', [], true, { shaderDescriptor, graph: this.graph });
  }
}

export default Graph;
