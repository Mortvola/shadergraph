import { runInAction } from "mobx";
import Http from "../../Http/src";
import type SceneObject from './SceneObject';
import TreeNode from "./TreeNode";
import type ObjectBase from "./ObjectBase";

class ObjectManager {
  // async get(nodeId: number, treeId: number | undefined) {
  //   const response = await Http.get<SceneObjectDescriptor | PrefabInstanceDescriptor>(`/api/scene-objects/${nodeId}${treeId !== undefined ? `/${treeId}` : ''}`)

  //   if (response.ok) {
  //     return await response.body();

  //     // if (isPrefabInstanceDescriptor(descriptor)) {
  //     //   if (type !== ObjectType.TreeInstance) {
  //     //     throw new Error('incorrect type:')
  //     //   }

  //     //   const prefabInstace = await PrefabInstance.fromDescriptor(descriptor);

  //     //   return prefabInstace?.root;
  //     //   // return undefined
  //     // }

  //     // if (type !== ObjectType.NodeObject) {
  //     //   throw new Error('incorrect type')
  //     // }

  //     // return SceneNode.fromDescriptor(descriptor)
  //   }  
  // }

  // async getSceneObject(nodeId: number, treeId: number | undefined) {
  //   const descriptor = await this.get(nodeId, treeId);

  //   if (isSceneObjectDescriptor(descriptor)) {
  //     return SceneObject.fromDescriptor(descriptor)
  //   }

  //   throw new Error('object type mismatch')
  // }

  async add(object: ObjectBase, parentNode?: TreeNode): Promise<TreeNode | undefined> {
    const descriptor = object.toDescriptor();

    const response = await Http.post<Omit<unknown, 'id'>, { id: number, nodeId: number }>(`/api/scene-objects`, {
      parentNodeId: parentNode?.treeId ?? parentNode?.id,
      parentSubnodeId: parentNode?.treeId !== undefined ? parentNode?.id : undefined,
      ...descriptor,
    });

    if (response.ok) {
      const body = await response.body();

      object.id = body.id;

      if (parentNode) {
        const node = new TreeNode(parentNode.scene)
  
        node.id = body.nodeId
        node.nodeObject = object as SceneObject;

        parentNode.addNode(node);

        return node
      }
    }  
  }

  static getUrl(object: SceneObject) {
    return `${object.nodeId}${object.treeId !== undefined ? `/${object.treeId}` : ''}`
  }

  async update(object: SceneObject) {
    const response = await Http.patch<unknown, void>(`/api/scene-objects/${ObjectManager.getUrl(object)}`, object.toDescriptor());

    if (response.ok) { /* empty */ }  
  }

  async delete(object: SceneObject) {
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
      const response = await Http.delete(`/api/scene-objects/${ObjectManager.getUrl(object)}`);

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
