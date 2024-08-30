import { Mat4, Quat, Vec4, mat4, quat } from 'wgpu-matrix';
import DrawableInterface from "../DrawableInterface";
import { SceneNodeInterface, RendererInterface, SceneGraphInterface, ComponentType, TransformPropsInterface } from '../../Types';
import { isDrawableNode } from './utils';
import Component from '../Component';
import DrawableComponent from '../DrawableComponent';
import { getEulerAngles } from '../../Math';
import TransformProps from '../../Properties/TransformProps';

export type HitTestResult = {
  drawable: DrawableInterface,
  t: number,
  point: Vec4,
}

const rotationOrder: quat.RotationOrder = 'xyz';

class SceneNode implements SceneNodeInterface {
  nodes: SceneNodeInterface[] = [];

  parentNode: SceneNodeInterface | null = null;

  components: Set<Component> = new Set();
  
  name = '';

  transform = mat4.identity();

  postTransforms: Mat4[] = [];

  transformProps: TransformPropsInterface = new TransformProps()

  qRotate = quat.fromEuler(0, 0, 0, rotationOrder);

  angles: number[];

  scene: SceneGraphInterface | null = null;

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
    mat4.translate(transform, this.transformProps.translate, this.transform);
    mat4.multiply(this.transform, this.getRotation(), this.transform);
    mat4.scale(this.transform, this.transformProps.scale, this.transform);

    for (const t of this.postTransforms) {
      mat4.multiply(this.transform, t, this.transform)
    }
  }

  computeCentroid(): Vec4 {
    throw new Error('not implementd');
  }

  addNode(node: SceneNodeInterface) {
    this.nodes.push(node);
    node.parentNode = this;

    this.scene?.nodeAdded(node);
  }

  removeNode(node: SceneNodeInterface) {
    const index = this.nodes.findIndex((n) => n === node);

    if (index !== -1) {      
      this.nodes = [
        ...this.nodes.slice(0, index),
        ...this.nodes.slice(index + 1)
      ]
    }

    node.parentNode = null;

    node.scene?.nodeRemoved(node)
  }

  detachSelf() {
    if (this.parentNode) {
      this.parentNode.removeNode(this)
    }
  }

  findNode(node: SceneNode) {
    const index = this.nodes.findIndex((n) => n === node);

    if (index === -1) {
      console.log('node not found!!!!')
    }
  }

  addComponent(component: Component) {
    this.components.add(component);
    component.sceneNode = this;

    this.scene?.componentAdded(component)
  }

  removeComponent(component: Component) {
    this.components.delete(component);
    component.sceneNode = null;
  }

  updateTransforms(mat = mat4.identity(), renderer: RendererInterface | null) {
    this.computeTransform(mat);
    
    for (const node of this.nodes) {
      node.computeTransform(this.transform);

      if (renderer) {
        if (isSceneNode(node)) {
          for (const component of Array.from(node.components)) {
            const c = component as DrawableComponent

            if (c.type === ComponentType.Drawable) {
              c.instanceIndex = c.drawable.numInstances;
              c.drawable.addInstanceInfo(node.transform, c.color);
  
              if (c.material.decal && renderer.decalPass) {
                renderer.decalPass?.addDrawable(c);
              }
              else if (c.material.transparent && renderer.transparentPass) {
                renderer.transparentPass!.addDrawable(c);
              }
              else if (c.material.lit && renderer.deferredRenderPass) {
                renderer.deferredRenderPass!.addDrawable(c);
              }
              else if (renderer.unlitRenderPass) {
                renderer.unlitRenderPass!.addDrawable(c);
              }    
            }
          }  

          node.updateTransforms(this.transform, renderer);
        }
      }
      else if (isSceneNode(node)) {
        node.updateTransforms(this.transform, renderer);
      }
    }
  }

  modelHitTest(origin: Vec4, ray: Vec4, filter?: (node: DrawableInterface) => boolean): HitTestResult | null {
    let best: HitTestResult | null = null;

    for (const node of this.nodes) {
      let result;
      if (isDrawableNode(node)) {
        if (!filter || filter(node.drawable)) {
          result = node.hitTest(origin, ray)    
        }
      }
      else if (isSceneNode(node)) {
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

export const isSceneNode = (r: unknown): r is SceneNode => (
  (r as SceneNode).nodes !== undefined
)

export default SceneNode;
