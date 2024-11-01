import SceneObject from './SceneObject'
import {
  type ModificationEntry,
  type SceneObjectInterface,
  type TreeModifierDescriptor,
} from './Types'

// type NodeId = number
type PathId = number

class ModifierNode {
  id: number

  sceneId: number

  rootNodeId: number

  rootSceneId: number

  modifications: Map<PathId, ModificationEntry> = new Map()

  constructor(descriptor: TreeModifierDescriptor) {
    this.id = descriptor.id
    this.sceneId = descriptor.sceneId
    this.rootNodeId = descriptor.rootNodeId
    this.rootSceneId = descriptor.rootSceneId

    for (const mod of descriptor.modifications) {
      // let pathMap = this.modifications.get(mod.nodeId)

      // if (pathMap === undefined) {
      //   pathMap = new Map()
      //   this.modifications.set(mod.nodeId, pathMap)
      // }

      this.modifications.set(mod.pathId, mod)
    }
  }

  getModificationEntry(pathId: number) {
    // let pathMap = this.modifications.get(nodeId)

    // if (pathMap === undefined) {
    //   pathMap = new Map()
    //   this.modifications.set(nodeId, pathMap)
    // }

    let mods = this.modifications.get(pathId)

    if (mods === undefined) {
      mods = { pathId, sceneObject: {}, addedNodes: [] }
      this.modifications.set(pathId, mods)
    }

    return mods;
  }

  async getObject(
    // nodeId: number,
    pathId: number,
    baseObject: SceneObjectInterface,
  ): Promise<SceneObjectInterface> {
    const mods = this.getModificationEntry(pathId);

    const object = await SceneObject.fromModifications(mods.sceneObject, baseObject)

    if (object === undefined) {
      throw new Error('object not defined')
    }

    object.modifierNode = this
    object.modifications = mods

    return object
  }

  addAddedNode(pathId: number, addedNodeId: number) {
    const mods = this.getModificationEntry(pathId)

    if (mods) {
      mods.addedNodes = [
        ...mods.addedNodes,
        addedNodeId,
      ]
      // const index = mods.addedNodes.findIndex((n) => n === addedNodeId)

      // if (index !== -1) {
      //   mods.addedNodes = [
      //     ...mods.addedNodes.slice(0, index),
      //     ...mods.addedNodes.slice(index + 1),
      //   ]
      // }
    }
  }

  removeAddedNode(pathId: number, addedNodeId: number) {
    const mods = this.getModificationEntry(pathId)

    if (mods) {
      const index = mods.addedNodes.findIndex((n) => n === addedNodeId)

      if (index !== -1) {
        mods.addedNodes = [
          ...mods.addedNodes.slice(0, index),
          ...mods.addedNodes.slice(index + 1),
        ]
      }
    }
  }
}

export const isModifierNode = (r: unknown): r is ModifierNode => (
  (r as ModifierNode)?.rootNodeId !== undefined
)

export default ModifierNode
