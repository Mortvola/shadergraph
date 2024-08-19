import { Vec4 } from "wgpu-matrix"
import DrawableNode from "../Drawables/SceneNodes/DrawableNode";

class Particle {
  velocity: Vec4;

  startTime: number;

  lifetime: number;

  drawable: DrawableNode;

  startSize: number;

  startColor: Vec4;

  constructor(velocity: Vec4, startTime: number, lifetime: number, drawable: DrawableNode, startSize: number, startColor: Vec4) {
    this.velocity = velocity;
    this.startTime = startTime;
    this.lifetime = lifetime;
    this.drawable = drawable;
    this.startSize = startSize;
    this.startColor = startColor;
  }
}

export default Particle;
