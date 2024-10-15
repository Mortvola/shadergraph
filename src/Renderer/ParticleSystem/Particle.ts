import type { Vec4 } from 'wgpu-matrix'
import type DrawableComponent from '../Drawables/DrawableComponent';
import { type RenderNodeInterface } from '../Types';

let id = 0;

class Particle {
  id: number;

  position: Vec4;

  velocity: Vec4;

  startTime: number;

  lastUpdateTime: number;

  lifetime: number;

  renderNode: RenderNodeInterface | null = null;

  drawable: DrawableComponent | null = null;

  startSize: [number, number, number];

  rotation: [number, number, number];

  startColor: Vec4;

  constructor(
    position: Vec4,
    velocity: Vec4,
    startTime: number,
    lifetime: number,
    startSize: [number, number, number],
    startRotation: [number, number,  number],
    startColor: Vec4,
  ) {
    this.id = id;
    id += 1;

    this.position = position;
    this.velocity = velocity;
    this.startTime = startTime;
    this.lastUpdateTime = startTime;
    this.lifetime = lifetime;
    this.startSize = startSize;
    this.rotation = startRotation;
    this.startColor = startColor;
  }
}

export default Particle;
