import { makeObservable, observable } from "mobx";
import { PSNumber, removeUndefinedKeys } from "../../Properties/Types";
import { Vec4, vec4 } from "wgpu-matrix";
import { SphereDescriptor } from "../Types";

class Sphere {
  _radius: PSNumber;

  get radius(): number {
    return this._radius.value
  }

  set radius(value: number) {
    this._radius.value = { value };
  }

  hemisphere = false;

  constructor(hemisphere = false, onChange?: () => void) {
    this._radius = new PSNumber(1, onChange)
    this.hemisphere = hemisphere;

    makeObservable(this, {
      _radius: observable,
    })
  }

  copyValues(other: Sphere, noOverrides = true) {
    this._radius.copyValues(other._radius, noOverrides);
  }

  hasOverrides() {
    return (
      this._radius.override
    )
  }

  static fromDescriptor(descriptor?: SphereDescriptor, onChange?: () => void) {
    const sphere = new Sphere(descriptor?.hemisphere ?? false, onChange);

    if (descriptor) {
      sphere.radius = descriptor.radius ?? sphere.radius;
    }

    return sphere;
  }

  applyOverrides(descriptor?: SphereDescriptor) {
    this._radius.applyOverride(descriptor?.radius)
  }

  toDescriptor(overridesOnly = false): SphereDescriptor | undefined {
    const descriptor = {
      radius: this._radius.toDescriptor(overridesOnly),
      hemisphere: (!overridesOnly || this._radius.override) ? this.hemisphere : undefined,
    }

    return removeUndefinedKeys(descriptor)
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
