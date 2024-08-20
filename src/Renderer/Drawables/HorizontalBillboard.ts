import { Vec4, Mat4 } from 'wgpu-matrix';
import Drawable from './Drawable';

class HorizontalBillboard extends Drawable {
  constructor() {
    super('HorizontalBillboard', 1);

    this.name = 'HorizontalBillboard'
  }

  render(passEncoder: GPURenderPassEncoder) {
    passEncoder.draw(6, this.numInstances);  
  }

  hitTest(p: Vec4, viewTransform: Mat4): { point: Vec4, t: number, drawable: Drawable} | null {
    return null;
  }
}

export default HorizontalBillboard;
