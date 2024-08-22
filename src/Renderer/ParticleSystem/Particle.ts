import { Vec4 } from "wgpu-matrix"
import DrawableComponent from "../Drawables/DrawableComponent";
import ContainerNode from "../Drawables/SceneNodes/ContainerNode";

let id = 0;

class Particle {
  id: number;

  position: Vec4;

  velocity: Vec4;

  startTime: number;

  lifetime: number;

  sceneNode: ContainerNode | null = null;
  
  drawable: DrawableComponent | null = null;

  startSize: number;

  startColor: Vec4;

  constructor(position: Vec4, velocity: Vec4, startTime: number, lifetime: number, startSize: number, startColor: Vec4) {
    this.id = id;
    id += 1;

    this.position = position;
    this.velocity = velocity;
    this.startTime = startTime;
    this.lifetime = lifetime;
    this.startSize = startSize;
    this.startColor = startColor;
  }
}

export default Particle;
