import { vec4, Vec4 } from 'wgpu-matrix';
import Component, { ComponentType } from './Component';

class Light extends Component {
  lightColor = vec4.create(1, 1, 1, 1);

  constant = 1.0;

  linear = 0.09;

  quadratic = 0.032;
  
  constructor() {
    super(ComponentType.Light)
  }

  get worldPosition(): Vec4 {
    if (this.sceneNode) {
      return vec4.transformMat4(vec4.create(0, 0, 0, 1), this.sceneNode.transform);
    }

    return vec4.create(0, 0, 0, 1);
  }

  computeCentroid(): Vec4 {
    return vec4.create(0, 0, 0, 1);
  }
}

export const isLight = (r: unknown): r is Light => (
  (r as Light).lightColor !== undefined
)

export default Light;
