import Entity from "../../State/Entity"
import { type ModelItemInterface } from "../../State/types"
import { type RenderNodeInterface } from "../Types";

export type ModelItemDescriptor = object

class ModelItem extends Entity implements ModelItemInterface {
  model: RenderNodeInterface

  // materials: Record<string, number>,

  onChange: (() => void) | null = null;

  constructor(model: RenderNodeInterface) {
    super(-1, '')

    this.model = model;
  }

  toDescriptor(): ModelItemDescriptor {
    return ({
      id: this.id,
      name: this.name,
    })
  }
}

export default ModelItem;


