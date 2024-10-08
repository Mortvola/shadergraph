import type { Vec4} from "wgpu-matrix";
import { mat4, vec4 } from "wgpu-matrix";
import type DrawableInterface from "./DrawableInterface";
import type { DrawableComponentInterface, MaterialInterface } from "../Types";
import { ComponentType } from "../Types";
import type { MaterialDescriptor } from "../Materials/MaterialDescriptor";
import { materialManager } from "../Materials/MaterialManager";
import Component from "./Component";

class DrawableComponent extends Component implements DrawableComponentInterface {
  name = '';

  drawable: DrawableInterface;

  material: MaterialInterface;

  color = new Float32Array(4);

  instanceIndex = 0;

  private constructor(drawable: DrawableInterface, material: MaterialInterface) {
    super(ComponentType.Drawable);
    this.drawable = drawable;
    this.material = material;
    this.color = material.color.slice();
  }

  static async create(drawable: DrawableInterface, materialDescriptor?: MaterialDescriptor | number): Promise<DrawableComponent> {
    const material = await materialManager.get(materialDescriptor, drawable.type, drawable.vertexProperties)

    return new DrawableComponent(drawable, material);
  }

  hitTest(origin: Vec4, vector: Vec4): { point: Vec4, t: number, drawable: DrawableInterface} | null {
    if (this.renderNode) {
      // Transform origin and ray into model space.
      const inverseTransform = mat4.inverse(this.renderNode.getTransform());
      const localVector = vec4.transformMat4(vector, inverseTransform);
      const localOrigin = vec4.transformMat4(origin, inverseTransform);

      const result = this.drawable.hitTest(localOrigin, localVector);

      if (result) {
        // Convert the intersection point into world coordinates.
        const point = vec4.transformMat4(result.point, this.renderNode.getTransform());

        return { point, t: result.t, drawable: this.drawable };      
      }
    }

    return null;
  }

  // computeTransform(transform = mat4.identity(), prepend = true): void {
  //   super.computeTransform(transform, prepend);

  //   this.instanceIndex = this.drawable.numInstances;
    
  //   this.drawable.addInstanceInfo(this.transform, this.color);
  // }
}

export default DrawableComponent;
