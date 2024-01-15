import { makeAutoObservable } from "mobx";
import GraphNode from "../shaders/ShaderBuilder/GraphNode";
import SampleTexture from "../shaders/ShaderBuilder/Nodes/SampleTexture";
import TileAndScroll from "../shaders/ShaderBuilder/Nodes/TileAndScroll";
import { InputPortInterface, OutputPortInterface } from "../shaders/ShaderBuilder/Types";
import GraphEdge from "../shaders/ShaderBuilder/GraphEdge";

class Graph {
  nodes: GraphNode[] = [];

  dragConnector: [number, number][] | null = null;

  edges: GraphEdge[] = [];

  constructor() {
    this.nodes = [
      new SampleTexture(),
      new TileAndScroll(),
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
}

export default Graph;
