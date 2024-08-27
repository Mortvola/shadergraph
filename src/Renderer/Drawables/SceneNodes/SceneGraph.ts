import ParticleSystem from "../../ParticleSystem/ParticleSystem";
import { SceneNodeInterface, RendererInterface, SceneGraphInterface, ComponentType } from "../../types";
import Component from "../Component";
import Light from "../Light";
import RangeCircle from "../RangeCircle";
import SceneNode, { isSceneNode } from "./SceneNode";

class SceneGraph implements SceneGraphInterface {
  scene = new SceneNode()

  lights: Set<Light> = new Set();

  rangeCircles: Set<RangeCircle> = new Set();

  particleSystems: Set<ParticleSystem> = new Set();

  constructor() {
    this.scene.scene = this;
  }

  addNode(node: SceneNodeInterface) {
    this.scene.addNode(node);
    this.nodeAdded(node);
  }

  nodeAdded(node: SceneNodeInterface) {
    let stack: SceneNodeInterface[] = [node]

    while (stack.length > 0) {
      const n = stack[0];
      stack = stack.slice(1);

      n.scene = this;

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

  removeNode(node: SceneNodeInterface) {
    this.scene.removeNode(node);
    this.nodeRemoved(node);
  }

  nodeRemoved(node: SceneNodeInterface) {
    let stack: SceneNodeInterface[] = [node]

    while (stack.length > 0) {
      const n = stack[0];
      stack = stack.slice(1);

      n.scene = null;
    
      if (isSceneNode(n)) {
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

  updateTransforms(renderer: RendererInterface | null) {
    this.scene.updateTransforms(undefined, renderer);
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
