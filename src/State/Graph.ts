import { makeAutoObservable, runInAction } from "mobx";
import SampleTexture from "../shaders/ShaderBuilder/Nodes/SampleTexture";
import TileAndScroll from "../shaders/ShaderBuilder/Nodes/TileAndScroll";
import { GraphNodeInterface, InputPortInterface, OutputPortInterface } from "../shaders/ShaderBuilder/Types";
import GraphEdge from "../shaders/ShaderBuilder/GraphEdge";
import Display from "../shaders/ShaderBuilder/Nodes/Display";

class Graph {
  nodes: GraphNodeInterface[] = [];

  dragConnector: [number, number][] | null = null;

  edges: GraphEdge[] = [];

  constructor() {
    this.nodes = [
      new Display(),
    ];

    makeAutoObservable(this);
  }

  setDragConnector(points: [number, number][] | null) {
    this.dragConnector = points;
  }

  link(outputPort: OutputPortInterface, inputPort: InputPortInterface) {
    const edge = new GraphEdge(outputPort, inputPort);

    this.edges.push(edge);
  }

  addNode(node: GraphNodeInterface) {
    runInAction(() => {
      this.nodes = this.nodes.concat(node);
    })
  }
}

export default Graph;
