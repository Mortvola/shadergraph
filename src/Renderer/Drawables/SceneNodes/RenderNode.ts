import type { Mat4, Quat, RotationOrder, Vec4} from 'wgpu-matrix';
import { mat4, quat, vec3 } from 'wgpu-matrix';
import type DrawableInterface from "../DrawableInterface";
import type { RenderNodeInterface, SceneGraphInterface} from '../../Types';
import { isDrawableComponent } from './utils';
import type Component from '../Component';
import { getEulerAngles } from '../../Math';

export type HitTestResult = {
  drawable: DrawableInterface,
  t: number,
  point: Vec4,
}

const rotationOrder: RotationOrder = 'xyz';

class RenderNode implements RenderNodeInterface {
  nodes: RenderNodeInterface[] = [];

  parentNode: RenderNodeInterface | null = null;

  components: Set<Component> = new Set();
  
  name = '';

  transform = mat4.identity();

  inverseTransform = mat4.identity();

  postTransforms: Mat4[] = [];

  translate = vec3.create(0, 0, 0)

  scale = vec3.create(1, 1, 1)

  qRotate = quat.fromEuler(0, 0, 0, rotationOrder);

  angles: number[];

  sceneGraph: SceneGraphInterface | null = null;

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

  computeTransform(transform = mat4.identity()) {
    mat4.translate(transform, this.translate, this.transform);
    mat4.multiply(this.transform, this.getRotation(), this.transform);
    mat4.scale(this.transform, this.scale, this.transform);

    mat4.inverse(this.transform, this.inverseTransform)

    for (const t of this.postTransforms) {
      mat4.multiply(this.transform, t, this.transform)
    }
  }

  computeCentroid(): Vec4 {
    throw new Error('not implementd');
  }

  addNode(node: RenderNodeInterface) {
    this.nodes.push(node);
    node.parentNode = this;

    this.sceneGraph?.nodeAdded(node);
  }

  removeNode(node: RenderNodeInterface) {
    const index = this.nodes.findIndex((n) => n === node);

    if (index !== -1) {      
      this.nodes = [
        ...this.nodes.slice(0, index),
        ...this.nodes.slice(index + 1)
      ]
    }

    node.parentNode = null;

    node.sceneGraph?.nodeRemoved(node)
  }

  detachSelf() {
    if (this.parentNode) {
      this.parentNode.removeNode(this)
    }
  }

  findNode(node: RenderNode) {
    const index = this.nodes.findIndex((n) => n === node);

    if (index === -1) {
      console.log('node not found!!!!')
    }
  }

  addComponent(component: Component) {
    this.components.add(component);
    component.renderNode = this;

    this.sceneGraph?.componentAdded(component)
  }

  removeComponent(component: Component) {
    this.components.delete(component);
    component.renderNode = null;
  }

  modelHitTest(origin: Vec4, ray: Vec4, filter?: (node: DrawableInterface) => boolean): HitTestResult | null {
    let best: HitTestResult | null = null;

    for (const node of this.nodes) {
      let result;
      if (isDrawableComponent(node)) {
        if (!filter || filter(node.drawable)) {
          result = node.hitTest(origin, ray)    
        }
      }
      else if (isRenderNode(node)) {
        result = node.modelHitTest(origin, ray, filter);
      }

      if (result) {
        if (best === null || result.t < best.t) {
          best = {
            drawable: result.drawable,
            t: result.t,
            point: result.point,
          }
        }
      }  
    }

    return best;
  }
}

export const isRenderNode = (r: unknown): r is RenderNode => (
  (r as RenderNode)?.nodes !== undefined
)

export default RenderNode;
