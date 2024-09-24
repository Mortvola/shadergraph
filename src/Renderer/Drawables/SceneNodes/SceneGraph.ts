import { type Mat4, mat4 } from "wgpu-matrix";
import type ParticleSystem from "../../ParticleSystem/ParticleSystem";
import type { RenderNodeInterface, RendererInterface, SceneGraphInterface} from "../../Types";
import { ComponentType } from "../../Types";
import type Component from "../Component";
import type Light from "../Light";
import type RangeCircle from "../RangeCircle";
import RenderNode, { isRenderNode } from "./RenderNode";
import type DrawableComponent from "../DrawableComponent";

class SceneGraph implements SceneGraphInterface {
  rootRenderNode = new RenderNode()

  lights: Set<Light> = new Set();

  rangeCircles: Set<RangeCircle> = new Set();

  particleSystems: Set<ParticleSystem> = new Set();

  constructor() {
    this.rootRenderNode.sceneGraph = this;
  }

  addNode(node: RenderNodeInterface) {
    this.rootRenderNode.addNode(node);
    this.nodeAdded(node);
  }

  nodeAdded(node: RenderNodeInterface) {
    let stack: RenderNodeInterface[] = [node]

    while (stack.length > 0) {
      const n = stack[0];
      stack = stack.slice(1);

      n.sceneGraph = this;

      stack.push(...n.nodes)

      // Look the set of components for lights and range circles and
      // add them to the appropriate set.
      for (const component of Array.from(n.components)) {
        this.componentAdded(component)
      }
    }
  }

  componentAdded(component: Component) {
    if (component.type === ComponentType.Light) {
      this.lights.add(component as Light)
    }
    else if (component.type === ComponentType.RangeCircle) {
      this.rangeCircles.add(component as RangeCircle)
    }
    else if (component.type === ComponentType.ParticleSystem) {
      this.particleSystems.add(component as ParticleSystem)
    }
  }

  removeNode(node: RenderNodeInterface) {
    this.rootRenderNode.removeNode(node);
    this.nodeRemoved(node);
  }

  nodeRemoved(node: RenderNodeInterface) {
    let stack: RenderNodeInterface[] = [node]

    while (stack.length > 0) {
      const n = stack[0];
      stack = stack.slice(1);

      n.sceneGraph = null;
    
      if (isRenderNode(n)) {
        stack.push(...n.nodes)

        // Look the set of components for lights and
        // remove them to the lights set.
        for (const component of Array.from(n.components)) {
          if (component.type === ComponentType.Light) {
            this.lights.delete(component as Light)
          }
          else if (component.type === ComponentType.RangeCircle) {
            this.rangeCircles.delete(component as RangeCircle)
          }
          else if (component.type === ComponentType.ParticleSystem) {
            const particleSystem = component as ParticleSystem;

            particleSystem.removeParticles()

            this.particleSystems.delete(component as ParticleSystem)
          }
        }
      }
    }
  }

  updateTransforms() {
    let stack: { node: RenderNodeInterface, transform: Mat4 }[] = [{ node: this.rootRenderNode, transform: mat4.identity() }];
  
    while (stack.length > 0) {
      const { node, transform } = stack[0];
      stack = stack.slice(1);

      node.computeTransform(transform);

      stack.push(...node.nodes.map((child) => ({ node: child, transform: node.transform })))
    }
  }

  addInstanceInfo(renderer: RendererInterface) {
    let stack: RenderNodeInterface[] = [this.rootRenderNode]

    while (stack.length > 0) {
      const node = stack[0];
      stack = stack .slice(1);

      for (const component of Array.from(node.components)) {
        const c = component as DrawableComponent

        if (c.type === ComponentType.Drawable) {
          c.instanceIndex = c.drawable.numInstances;
          c.drawable.addInstanceInfo(node.transform, node.inverseTransform, c.color);

          if (c.material.decal && renderer.decalPass) {
            renderer.decalPass.addDrawable(c);
          }
          else if (c.material.transparent && renderer.transparentPass) {
            renderer.transparentPass.addDrawable(c);
          }
          else if (c.material.lit && renderer.deferredRenderPass) {
            renderer.deferredRenderPass.addDrawable(c);
          }
          else if (renderer.unlitRenderPass) {
            renderer.unlitRenderPass.addDrawable(c);
          }    
        }
      }

      stack.push(...node.nodes)
    }
  }

  getRangeCircles() : RangeCircle[] {
    const circles: RangeCircle[] = [];

    this.rangeCircles.forEach((c) => circles.push(c))
    
    return circles
  }

  getLights() : Light[] {
    const lights: Light[] = [];

    this.lights.forEach((c) => lights.push(c))
    
    return lights
  }
}

export default SceneGraph;
