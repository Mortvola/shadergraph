import { mat4, vec3, Vec4, Mat4, quat, Quat } from 'wgpu-matrix';
import { getEulerAngles } from '../../Math';
import { SceneNodeInterface } from '../../types';

export const rotationOrder: quat.RotationOrder = 'xyz';

class SceneNode implements SceneNodeInterface {
  uuid = crypto.randomUUID() as string;

  name = '';

  transform = mat4.identity();

  postTransforms: Mat4[] = [];

  translate = vec3.create(0, 0, 0);

  qRotate = quat.fromEuler(0, 0, 0, rotationOrder);

  angles: number[];

  scale = vec3.create(1, 1, 1);

  constructor() {
    this.angles = getEulerAngles(this.qRotate);
  }

  getTransform(): Mat4 {
    return this.transform
  }

  getRotation(): Mat4 {
    return mat4.fromQuat(this.qRotate);
  }

  rotate(x: number, y: number, z: number) {
    const q = quat.fromEuler(x, y, z, rotationOrder);

    this.qRotate = quat.multiply(this.qRotate, q);

    this.angles = getEulerAngles(this.qRotate);
  }

  setFromAngles(x: number, y: number, z: number): void {
    this.qRotate = quat.fromEuler(x, y, z, rotationOrder);
    this.angles = [x, y, z];
  }

  setQRotate(q: Quat) {
    this.qRotate = q;
    this.angles = getEulerAngles(this.qRotate);
  }

  computeTransform(transform = mat4.identity(), prepend = true) {
    mat4.translate(transform, this.translate, this.transform);
    mat4.multiply(this.transform, this.getRotation(), this.transform);
    mat4.scale(this.transform, this.scale, this.transform);

    for (const t of this.postTransforms) {
      mat4.multiply(this.transform, t, this.transform)
    }
  }

  computeCentroid(): Vec4 {
    throw new Error('not implementd');
  }
}

export default SceneNode;
