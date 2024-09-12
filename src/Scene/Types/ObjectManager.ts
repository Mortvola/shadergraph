import { runInAction } from "mobx";
import Http from "../../Http/src";
import SceneObject from "./SceneObject";
import {
  isSceneNodeDescriptor, isTreeDescriptor, isTreeNodeDescriptor, type PrefabInstanceDescriptor, type SceneNodeDescriptor,
} from "./Types";
import Tree from "./Tree";
import TreeNode from "./TreeNode";
import type ObjectBase from "./ObjectBase";

class ObjectManager {
  async get(id: number) {
    const response = await Http.get<SceneNodeDescriptor | PrefabInstanceDescriptor>(`/api/scene-objects/${id}`)

    if (response.ok) {
      return await response.body();

      // if (isPrefabInstanceDescriptor(descriptor)) {
      //   if (type !== ObjectType.TreeInstance) {
      //     throw new Error('incorrect type:')
      //   }

      //   const prefabInstace = await PrefabInstance.fromDescriptor(descriptor);

      //   return prefabInstace?.root;
      //   // return undefined
      // }

      // if (type !== ObjectType.NodeObject) {
      //   throw new Error('incorrect type')
      // }

      // return SceneNode.fromDescriptor(descriptor)
    }  
  }

  async getTree(id: number) {
    const descriptor = await this.get(id);

    if (isTreeDescriptor(descriptor)) {
      return Tree.fromDescriptor(descriptor)
    }

    throw new Error('object type mismatch')
  }

  async getTreeNode(id: number) {
    const descriptor = await this.get(id);

    if (isTreeNodeDescriptor(descriptor)) {
      return TreeNode.fromDescriptor(descriptor)
    }

    throw new Error('object type mismatch')
  }

  async getSceneNode(id: number) {
    const descriptor = await this.get(id);

    if (isSceneNodeDescriptor(descriptor)) {
      return SceneObject.fromDescriptor(descriptor)
    }

    throw new Error('object type mismatch')
  }

  async add(object: ObjectBase) {
    const descriptor = object.toDescriptor();

    const response = await Http.post<Omit<unknown, 'id'>, { id: number }>(`/api/scene-objects`, descriptor);

    if (response.ok) {
      const body = await response.body();

      object.id = body.id;
    }  
  }

  async update(object: ObjectBase) {
    const response = await Http.patch<unknown, void>(`/api/scene-objects/${object.id}`, object.toDescriptor());

    if (response.ok) { /* empty */ }  

  }

  async delete(object: ObjectBase) {
    // if (isPrefabInstanceObject(object)) {
    //   const prefabInstance = object.prefabInstance;

    //   const response = await Http.delete(`/api/scene-objects/${prefabInstance.id}`);

    //   if (response.ok) {
    //     prefabInstance.autosave = false;
        
    //     const instanceRoot = object.prefabInstance.root;
    //     if (instanceRoot) {
    //       let stack: SceneNodeBaseInterface[] = [instanceRoot];
    
    //       while (stack.length > 0) {
    //         const instanceObject = stack[0];
    //         stack = stack.slice(1);
    
    //         // For the root node, detach it from its connection. This should
    //         // cause the parent object to save without the connection and
    //         // remove the scene node from the scene graph.
    //         // For all other nodes, just manually detach the scene node from the scene
    //         // graph.
    //         if (instanceObject === instanceRoot) {
    //           instanceObject.detachSelf();
    //         }
    //         else {
    //           instanceObject.renderNode.detachSelf()
    //         }
    
    //         stack = stack.concat(instanceObject.nodes.map((o) => o));
    //       }
    //     }
    //   }
    // }
    // else {
      const response = await Http.delete(`/api/scene-objects/${object.id}`);

      if (response.ok) {
        runInAction(() => {
          object.detachSelf()
        })
      }
    // }
  }
}

export const objectManager = new ObjectManager;

export default ObjectManager;
