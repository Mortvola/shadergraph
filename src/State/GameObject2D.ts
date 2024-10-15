import Entity from './Entity';
import type { GameObject2DRecord } from '../Renderer/Types';
import type { GameObject2DInterface } from './types';
import Http from '../Http/src';

class GameObject2D extends Entity implements GameObject2DInterface {
  width = 1

  height = 1

  x = -this.width / 2

  y = this.height / 2

  material: number | null = null

  nodes: GameObject2D[] = []

  constructor(id: number, name: string, gameObject: GameObject2DRecord) {
    super(id, name)

    this.width = gameObject.object.width!;
    this.height = gameObject.object.height!;
    this.x = gameObject.object.x!;
    this.y = gameObject.object.y!;
    this.material = gameObject.object.material ?? null
  }

  async save(): Promise<void> {
    const response = await Http.patch<GameObject2DRecord, void>(`/api/scene-objects/${this.id}`, {
      id: this.id,
      name: this.name,
      object: {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        material: this.material ?? undefined,
      }
    });

    if (response.ok) {

    }
  }

}

export default GameObject2D;
