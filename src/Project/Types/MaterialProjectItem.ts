import { runInAction } from 'mobx';
import { materialManager } from '../../Renderer/Materials/MaterialManager';
import type { MaterialItemInterface } from '../../State/types';
import ProjectItem from './ProjectItem';
import type { FolderInterface} from './types';
import { ProjectItemType } from './types';

class MaterialProjectItem extends ProjectItem<MaterialItemInterface> {
  constructor(id: number, name: string, parent: FolderInterface | null, itemId: number | null) {
    super(id, name, ProjectItemType.Material, parent, itemId);
  }

  async getItem(): Promise<MaterialItemInterface | null> {
    if (this.item) {
      return this.item;
    }

    if (this.itemId !==  null) {
      const materialItem = await materialManager.getItem(this.itemId) ?? null;

      if (materialItem) {
        runInAction(() => {
          this.item = materialItem;
        })

        return materialItem;
      }
    }

    return null;
  }
}

export default MaterialProjectItem;
