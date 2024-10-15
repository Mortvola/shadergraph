import type { Vec4, Mat4 } from 'wgpu-matrix';
import Drawable from './Drawable';
import { DrawableType } from './DrawableInterface';

class Billboard extends Drawable {
  constructor() {
    super(DrawableType.Billboard, 1);

    this.name = 'Billboard'
  }

  render(passEncoder: GPURenderPassEncoder) {
    passEncoder.draw(6, this.numInstances);
  }

  addInstanceInfo(transform: Mat4, inverseTransform: Mat4, color: Vec4) {
    super.addInstanceInfo(transform, inverseTransform, color)
  }

  hitTest(p: Vec4, viewTransform: Mat4): { point: Vec4, t: number, drawable: Drawable} | null {
    return null;
  }
}

export default Billboard;
