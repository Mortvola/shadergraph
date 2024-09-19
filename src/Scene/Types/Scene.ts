import { observable, runInAction } from "mobx";
import { store } from "../../State/store";
import Http from "../../Http/src";
import { type SceneDescriptor } from "./Types";
import type { SceneInterface, SceneItemType, SceneObjectDescriptor } from "./Types";
import TreeNode from "./TreeNode";
import SceneObject from "./SceneObject";

type TreeNodeDescriptor = {
  id: number,
  treeId?: number,
  objectId: number,
  children: TreeNodeDescriptor[],
}

type NodesResponse = { root: TreeNodeDescriptor, objects: SceneObjectDescriptor[] }

class Scene implements SceneInterface {
  id: number = -1;

  name: string = '';

  @observable
  accessor root: TreeNode | undefined

  @observable
  accessor selectedNode: TreeNode | null = null;

  draggingNode: TreeNode | null = null;

  static async fromDescriptor(descriptor?: SceneDescriptor) {
    const scene = new Scene();

    if (descriptor) {
      scene.id = descriptor.id;
      scene.name = descriptor.name;
      // scene.root = descriptor.treeId;

      const response = await Http.get<NodesResponse>(`/api/tree-nodes/${descriptor.rootNodeId}`)

      if (response.ok) {
        const body = await response.body();

        const objectMap: Map<number, SceneObject> = new Map();

        // Sort the objects so that the base objects are instantiated first
        body.objects.sort((a, b) => {
          if (a.baseObjectId === undefined) {
            if (b.baseObjectId === undefined) {
              return 0
            }

            return -1;
          }

          if (b.baseObjectId === undefined) {
            return 1;
          }

          if (a.baseObjectId === b.id) {
            return 1;
          }
          
          if (b.baseObjectId === a.id) {
            return -1;
          }

          return 0;
        })

        // console.log(JSON.stringify(body.objects, undefined, 4))

        for (const object of body.objects) {
          let baseObject: SceneObject | undefined = undefined;

          if (object.baseObjectId !== undefined) {
            baseObject = objectMap.get(object.baseObjectId)

            if (baseObject === undefined) {
              console.log('base object not instantiated')
            }
          }
    
          const sceneObject = await SceneObject.fromDescriptor(object, baseObject)
          objectMap.set(object.id, sceneObject)
        }

        // Link overriding objects to their base objects
        // for (const object of body.objects) {
        //   if (object.baseObjectId !== undefined) {
        //     const override = objectMap.get(object.id)

        //     if (override) {
        //       const baseObject = objectMap.get(object.baseObjectId)
        //       override.baseObject = baseObject  
        //     }
        //   }
        // }

        let stack: { nodeDescriptor: TreeNodeDescriptor, parent: TreeNode | undefined }[] = [{ nodeDescriptor: body.root, parent: undefined }]

        while (stack.length > 0) {
          const { nodeDescriptor, parent } = stack[0]
          stack = stack.slice(1)

          const node = new TreeNode()

          node.id = nodeDescriptor.id;
          node.treeId = nodeDescriptor.treeId;

          const object = objectMap.get(nodeDescriptor.objectId)

          if (object) {
            // while (object) {
            //   if (!object.baseObject) {
            //     break
            //   }

            //   object = object.baseObject as SceneObject;
            // }

            node.nodeObject = object;
          }
          else {
            console.log('object not found')
          }
  
          node.name = node.nodeObject.name;

          if (parent) {
            parent.autosave = false;
            parent.addNode(node)
            parent.autosave = true;
          }
          else {
            scene.root = node;
          }

          stack = stack.concat(nodeDescriptor.children.map((child) => ({ nodeDescriptor: child, parent: node })))
        }
      }
    }

    return scene;
  }

  toDescriptor(): SceneDescriptor {
    return ({
      id: this.id,
      name: this.name,
      rootNodeId: this.root!.id,
    })
  }

  setSelectedObject(node: TreeNode | null) {
    runInAction(() => {
      this.selectedNode = node;
    })
  }

  async renderScene() {
    if (this.root) {
      store.mainView.addSceneNode(this.root.renderNode);
    }
  }

  addNode(node: TreeNode, autosave = true) {
    if (this.selectedNode) {
      this.selectedNode.autosave = autosave
      this.selectedNode.addNode(node)
      this.selectedNode.autosave = true
    }
    else if (this.root) {
      this.root.autosave = autosave
      this.root.addNode(node)
      this.root.autosave = true
    }
    else {
      this.root = node;
    }
  }

  saveChanges = async () => {
    if (this.id < 0) {
      await Http.post('/api/scenes', this.toDescriptor())  
    }
    else {
      await Http.patch(`/api/scenes/${this.id}`, this.toDescriptor())  
    }
  }

  addNewItem(type: SceneItemType) {
    runInAction(() => {
      let parent: TreeNode | undefined = this.selectedNode ?? undefined

      if (parent === null) {
        parent = this.root;
      }

      if (parent) {
        parent.newItemType = type;
      }
    })
  }
}

export default Scene;
