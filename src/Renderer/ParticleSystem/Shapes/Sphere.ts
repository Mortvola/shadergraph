import { makeObservable, observable, runInAction } from "mobx";
import { SphereDescriptor } from "../Types";
import { Vec4, vec4 } from "wgpu-matrix";

class Sphere {
  radius = 1;

  onChange?: () => void;

  constructor(onChange?: () => void) {
    this.onChange = onChange;

    makeObservable(this, {
      radius: observable,
    })
  }

  static fromDescriptor(descriptor?: SphereDescriptor, onChange?: () => void) {
    const sphere = new Sphere(onChange);

    if (descriptor) {
      sphere.radius = descriptor.radius;
    }

    return sphere;
  }

  toDescriptor(): SphereDescriptor {
    return ({
      radius: this.radius
    })
  }

  setRadius(radius: number) {
    runInAction(() => {
      this.radius = radius;

      if (this.onChange) {
        this.onChange();
      }
    })
  }

  getPositionAndDirection(): [Vec4, Vec4] {
    const p = Sphere.getPoint(this.radius);
    return [p, p];
  }

  // Find random point on a sphere with uniform distribution
  // Source: http://mathworld.wolfram.com/SpherePointPicking.html
  private static getPoint(radius: number) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);

    const x = sinPhi * cosTheta;
    const y = sinPhi * sinTheta;
    const z = cosPhi;

    //const r = Math.cbrt(Math.random());
    const r  = radius;

    return vec4.create(x * r, y * r, z * r, 1);
  }
}

export default Sphere;
