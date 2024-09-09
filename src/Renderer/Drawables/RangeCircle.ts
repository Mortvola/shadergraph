import type { Vec4 } from 'wgpu-matrix';
import { mat4, vec4 } from 'wgpu-matrix';
import Component from './Component';
import { ComponentType } from '../Types';

class RangeCircle extends Component {
  color;

  radius: number;

  thickness: number;

  constructor(radius: number, thickness: number, color = vec4.create(1, 1, 1, 1)) {
    super(ComponentType.RangeCircle)

    this.radius = radius;
    this.thickness = thickness;
    this.color = color;
  }

  get transform() {
    if (this.renderNode) {
      return this.renderNode.transform;
    }

    return mat4.identity()
  }

  computeCentroid(): Vec4 {
    return vec4.create(0, 0, 0, 1);
  }
}

export default RangeCircle;
