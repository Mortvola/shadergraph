import { Vec4, mat4 } from 'wgpu-matrix';
import DrawableInterface from "../DrawableInterface";
import SceneNode from "./SceneNode";
import { ContainerNodeInterface, SceneNodeInterface, RendererInterface } from '../../types';
import { isDrawableNode } from './utils';
import Component from '../Component';
import DrawableComponent from '../DrawableComponent';

export type HitTestResult = {
  drawable: DrawableInterface,
  t: number,
  point: Vec4,
}

class ContainerNode extends SceneNode implements ContainerNodeInterface {
  nodes: SceneNodeInterface[] = [];

  components: Set<Component> = new Set();
  
  addNode(node: SceneNodeInterface) {
    this.nodes.push(node);
  }

  removeNode(node: SceneNodeInterface) {
    const index = this.nodes.findIndex((n) => n === node);

    if (index !== -1) {
      this.nodes = [
        ...this.nodes.slice(0, index),
        ...this.nodes.slice(index + 1)
      ]
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
        if (isContainerNode(node)) {
          for (const component of Array.from(node.components)) {
            const c = component as DrawableComponent

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
      }
      else if (isContainerNode(node)) {
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
      else if (isContainerNode(node)) {
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

export const isContainerNode = (r: unknown): r is ContainerNode => (
  (r as ContainerNode).nodes !== undefined
)

export default ContainerNode;
