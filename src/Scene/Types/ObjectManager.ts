import { runInAction } from "mobx";
import Http from "../../Http/src";
import PrefabInstance from "./PrefabInstance";
import SceneNode from "./SceneNode";
import type { SceneNodeBase } from "./SceneNodeBase";
import type { SceneNodeBaseInterface} from "./Types";
import {
  isPrefabInstanceDescriptor, type PrefabInstanceDescriptor, type SceneNodeDescriptor,
} from "./Types";
import { isPrefabInstanceObject } from "./PrefabNodeInstance";

class ObjectManager {
  async get(id: number) {
    const response = await Http.get<SceneNodeDescriptor | PrefabInstanceDescriptor>(`/api/scene-objects/${id}`)

    if (response.ok) {
      const descriptor = await response.body();

      if (isPrefabInstanceDescriptor(descriptor)) {
        const prefabInstace = await PrefabInstance.fromDescriptor(descriptor);

        return prefabInstace?.root;
        // return undefined
      }

      return SceneNode.fromDescriptor(descriptor)
    }  
  }

  async add(object: SceneNodeBase) {
    const descriptor = object.toDescriptor();

    const response = await Http.post<Omit<unknown, 'id'>, { id: number }>(`/api/scene-objects`, descriptor);

    if (response.ok) {
      const body = await response.body();

      object.id = body.id;
    }  
  }

  async update(object: SceneNodeBase) {
    const response = await Http.patch<unknown, void>(`/api/scene-objects/${object.id}`, object.toDescriptor());

    if (response.ok) { /* empty */ }  

  }

  async delete(object: SceneNodeBase) {
    if (isPrefabInstanceObject(object)) {
      const prefabInstance = object.prefabInstance;

      const response = await Http.delete(`/api/scene-objects/${prefabInstance.id}`);

      if (response.ok) {
        prefabInstance.autosave = false;
        
        const instanceRoot = object.prefabInstance.root;
        if (instanceRoot) {
          let stack: SceneNodeBaseInterface[] = [instanceRoot];
    
          while (stack.length > 0) {
            const instanceObject = stack[0];
            stack = stack.slice(1);
    
            // For the root node, detach it from its connection. This should
            // cause the parent object to save without the connection and
            // remove the scene node from the scene graph.
            // For all other nodes, just manually detach the scene node from the scene
            // graph.
            if (instanceObject === instanceRoot) {
              instanceObject.detachSelf();
            }
            else {
              instanceObject.renderNode.detachSelf()
            }
    
            stack = stack.concat(instanceObject.nodes.map((o) => o));
          }
        }
      }
    }
    else {
      const response = await Http.delete(`/api/scene-objects/${object.id}`);

      if (response.ok) {
        runInAction(() => {
          object.detachSelf()
        })
      }
    }
  }
}

export const objectManager = new ObjectManager;

export default ObjectManager;
