import { runInAction } from 'mobx';
import Http from '../../Http/src';
import type { ShaderRecord } from '../../Renderer/Types';
import Graph from '../../State/Graph';
import { store } from '../../State/store';
import ProjectItem from './ProjectItem';
import type { FolderInterface} from './types';
import { ProjectItemType } from './types';
import type { GraphInterface } from '../../State/GraphInterface';
import { shaderManager } from '../../Renderer/shaders/ShaderManager';

class ShaderProjectItem extends ProjectItem<GraphInterface> {
  constructor(id: number, name: string, parent: FolderInterface | null, itemId: number | null) {
    super(id, name, ProjectItemType.Shader, parent, itemId);
  }

  async getItem(): Promise<GraphInterface | null> {
    if (this.item) {
      return this.item;
    }

    if (this.itemId !== null) {
      const shaderRecord = await shaderManager.getShader(this.itemId);

      if (shaderRecord) {
        const shader = new Graph(store, shaderRecord.id, shaderRecord.name, shaderRecord.descriptor);

        runInAction(() => {
          this.item = shader
        })

        return shader;
      }
    }

    return null;
  }
}

export default ShaderProjectItem;
