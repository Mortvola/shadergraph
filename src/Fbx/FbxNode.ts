import { quat, vec3, type RotationOrder } from "wgpu-matrix";
import { getEulerAngles } from "../Renderer/Math";
import type { FbxNodeInterface } from "./types";

export const rotationOrder: RotationOrder = 'xyz';

class FbxNode implements FbxNodeInterface {
  name = '';

  scale = vec3.create(1, 1, 1);

  translate = vec3.create(0, 0, 0);

  qRotate = quat.fromEuler(0, 0, 0, rotationOrder);

  angles: number[];

  constructor() {
    this.angles = getEulerAngles(this.qRotate);
  }

  setFromAngles(x: number, y: number, z: number): void {
    this.qRotate = quat.fromEuler(x, y, z, rotationOrder);
    this.angles = [x, y, z];
  }
}

export default FbxNode;
