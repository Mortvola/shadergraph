import type { Vec4 } from 'wgpu-matrix';
import { vec4 } from 'wgpu-matrix';
import Component from './Component';
import type { LightInterface, LightPropsInterface } from '../Types';
import { ComponentType } from '../Types';

class Light extends Component implements LightInterface {
  props: LightPropsInterface;

  constructor(props: LightPropsInterface) {
    super(ComponentType.Light)

    this.props = props;
  }

  get worldPosition(): Vec4 {
    if (this.renderNode) {
      return vec4.transformMat4(vec4.create(0, 0, 0, 1), this.renderNode.transform);
    }

    return vec4.create(0, 0, 0, 1);
  }

  computeCentroid(): Vec4 {
    return vec4.create(0, 0, 0, 1);
  }
}

export default Light;
