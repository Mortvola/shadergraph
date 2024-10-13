import { makeObservable, observable, runInAction } from "mobx";
import type { GraphEdgeInterface, GraphNodeInterface, InputPortInterface, OutputPortInterface, PortInterface, PropertyInterface } from "../Renderer/ShaderBuilder/Types";
import GraphEdge from "../Renderer/ShaderBuilder/GraphEdge";
import Display from "../Renderer/ShaderBuilder/Nodes/Display";
import type { MaterialInterface } from "../Renderer/Types";
import type { ShaderDescriptor } from "../Renderer/shaders/ShaderDescriptor";
import Material from "../Renderer/Materials/Material";
import ShaderGraph from "../Renderer/ShaderBuilder/ShaderGraph";
import type { StoreInterface } from "./StoreInterface";
import type { GraphInterface } from "./GraphInterface";
import { DrawableType } from "../Renderer/Drawables/DrawableInterface";

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

  dragConnector: { port: PortInterface, point: [number, number] } | null = null;

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

    // If there is a display node then hook up the change
    // handler
    const displayNode = this.graph.getDisplayNode()

    if (displayNode) {
      displayNode.onChange = () => {
        this.applyMaterial()
      }
    }

    makeObservable(this, {
      name: observable,
      selectedNode: observable,
    });

    makeObservable(this.graph, {
      lit: observable,
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

  setDragConnector(connector: { port: PortInterface, point: [number, number] } | null): void {
    this.dragConnector = connector;
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
    edge.unlink()

    // Find the edge in the edge list and remove it
    const index = this.graph.fragment.edges.findIndex((e) => e === edge);
    
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

  setLit(lit: boolean): void {
    runInAction(() => {
      this.graph.lit = lit;
      this.changed = true;
      this.applyMaterial()
    })
  }

  async applyMaterial(): Promise<void> {
    const material = await this.generateMaterial();

    if (material) {
      this.store.previewModeler.applyMaterial(material);
    }  
  }

  async generateMaterial(): Promise<MaterialInterface> {
    // Find a preview node.
    const preview = this.graph.fragment.nodes.find((n) => n.type === 'Preview');

    return await Material.create(DrawableType.Mesh, [], { graph: this.graph, root: preview });
  }
}

export default Graph;
