import { makeObservable, observable } from "mobx";
import { PSNumber, SphereDescriptor } from "../Types";
import { Vec4, vec4 } from "wgpu-matrix";

class Sphere {
  _radius: PSNumber;

  get radius(): number {
    return this._radius.value
  }

  set radius(newValue: number) {
    this._radius.value = newValue;
  }

  hemisphere = false;

  constructor(hemisphere = false, onChange?: () => void) {
    this._radius = new PSNumber(1, onChange)
    this.hemisphere = hemisphere;

    makeObservable(this, {
      _radius: observable,
    })
  }

  static fromDescriptor(descriptor?: SphereDescriptor, onChange?: () => void) {
    const sphere = new Sphere(descriptor?.hemisphere ?? false, onChange);

    if (descriptor) {
      sphere.radius = descriptor.radius ?? sphere.radius;
    }

    return sphere;
  }

  toDescriptor(): SphereDescriptor {
    return ({
      radius: this.radius,
      hemisphere: this.hemisphere
    })
  }

  getPositionAndDirection(): [Vec4, Vec4] {
    const p = this.getPoint();
    return [p, p];
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
    const r  = this.radius;

    return vec4.create(x * r, y * r, z * r, 1);
  }
}

export default Sphere;
