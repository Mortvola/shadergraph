import type { PropsBase} from "../../Properties/Types";
import { removeUndefinedKeys } from "../../Properties/Types";
import type { Vec4} from "wgpu-matrix";
import { vec4 } from "wgpu-matrix";
import type { SphereDescriptor } from "../Types";
import { PSNumber } from "../../Properties/Property";

class Sphere {
  radius: PSNumber;

  hemisphere = false;

  constructor(props: PropsBase, hemisphere = false, descriptor?: SphereDescriptor, onChange?: () => void, previousProps?: Sphere) {
    this.radius = new PSNumber('Radius', props, descriptor?.radius, 1, onChange, previousProps?.radius)
    this.hemisphere = hemisphere;
  }

  toDescriptor(overridesOnly = false): SphereDescriptor | undefined {
    const descriptor = {
      radius: this.radius.toDescriptor(overridesOnly),
      hemisphere: (!overridesOnly || this.radius.override) ? this.hemisphere : undefined,
    }

    return removeUndefinedKeys(descriptor)
  }

  getPositionAndDirection(): [Vec4, Vec4] {
    const p = this.getPoint();
    const direction = vec4.normalize(vec4.subtract(p, vec4.create(0, 0, 0, 1)));

    return [p, direction];
  }

  // Find random point on a sphere with uniform distribution
  // Source: http://mathworld.wolfram.com/SpherePointPicking.html
  private getPoint() {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);

    const x = sinPhi * cosTheta;
    let y = sinPhi * sinTheta;
    const z = cosPhi;

    if (this.hemisphere) {
      y = Math.abs(y);
    }
  
    //const r = Math.cbrt(Math.random());
    const r  = this.radius.get();

    return vec4.create(x * r, y * r, z * r, 1);
  }
}

export default Sphere;
