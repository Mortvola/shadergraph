import type { ConeDescriptor } from "../Types";
import type { Vec4} from "wgpu-matrix";
import { mat4, vec4 } from "wgpu-matrix";
import { degToRad } from "../../Math";
import type { PropsBase} from "../../Properties/Types";
import { removeUndefinedKeys } from "../../Properties/Types";
import { PSNumber } from "../../Properties/Property";

class Cone {
  angle: PSNumber;

  originRadius: PSNumber;

  constructor(props: PropsBase, descriptor?: ConeDescriptor, onChange?: () => void, previousProp?: Cone) {
    this.angle = new PSNumber(props, descriptor?.angle, 25, onChange, previousProp?.angle);
    this.originRadius = new PSNumber(props, descriptor?.originRadius, 1, onChange, previousProp?.originRadius);
  }

  toDescriptor(overridesOnly  = false): ConeDescriptor | undefined {
    const descriptor = {
      angle: this.angle.toDescriptor(overridesOnly),
      originRadius: this.originRadius.toDescriptor(overridesOnly),
    }

    return removeUndefinedKeys(descriptor)
  }

  getPositionAndDirection(): [Vec4, Vec4] {
    const origin = vec4.create(0, 0, 0, 1)

    // const offset = Math.random() * this.originRadius;
    const offset = this.originRadius.get();
    const rotate = degToRad(Math.random() * 360);

    let transform = mat4.identity()
    mat4.rotateY(transform, rotate, transform)
    mat4.translate(transform, vec4.create(0, 0, offset, 1), transform)
    vec4.transformMat4(origin, transform, origin)

    const p1 = vec4.create(0, 1, 0, 1);

    transform = mat4.identity()
    mat4.rotateY(transform, rotate, transform)
    mat4.translate(transform, vec4.create(0, 0, offset, 1), transform)
    mat4.rotateX(transform, degToRad(this.angle.get()), transform)
    vec4.transformMat4(p1, transform, p1)

    const direction = vec4.subtract(p1, origin)

    return [origin, direction];
  }
}

export default Cone;
