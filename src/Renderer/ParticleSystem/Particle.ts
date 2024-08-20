import { Vec4 } from "wgpu-matrix"
import DrawableNode from "../Drawables/SceneNodes/DrawableNode";

class Particle {
  position: Vec4;

  velocity: Vec4;

  startTime: number;

  lifetime: number;

  drawable: DrawableNode | null;

  startSize: number;

  startColor: Vec4;

  constructor(position: Vec4, velocity: Vec4, startTime: number, lifetime: number, drawable: DrawableNode | null, startSize: number, startColor: Vec4) {
    this.position = position;
    this.velocity = velocity;
    this.startTime = startTime;
    this.lifetime = lifetime;
    this.drawable = drawable;
    this.startSize = startSize;
    this.startColor = startColor;
  }
}

export default Particle;
