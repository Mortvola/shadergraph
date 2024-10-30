import SceneObject from './SceneObject'
import {
  type ModificationEntry,
  type SceneObjectInterface,
  type TreeModifierDescriptor,
} from './Types'

type NodeId = number
type PathId = number

class ModifierNode {
  id: number

  rootNodeId: number

  modifications: Map<NodeId, Map<PathId, ModificationEntry>> = new Map()

  constructor(descriptor: TreeModifierDescriptor) {
    this.id = descriptor.id
    this.rootNodeId = descriptor.rootNodeId

    for (const mod of descriptor.modifications) {
      let pathMap = this.modifications.get(mod.nodeId)

      if (pathMap === undefined) {
        pathMap = new Map()
        this.modifications.set(mod.nodeId, pathMap)
      }

      pathMap.set(mod.pathId, mod)
    }
  }

  getModificationEntry(nodeId: number, pathId: number) {
    let pathMap = this.modifications.get(nodeId)

    if (pathMap === undefined) {
      pathMap = new Map()
      this.modifications.set(nodeId, pathMap)
    }

    let mods = pathMap.get(pathId)

    if (mods === undefined) {
      mods = { nodeId, pathId, modifications: {}, addedNodes: [] }
      pathMap.set(pathId, mods)
    }

    return mods;
  }

  async getObject(
    nodeId: number,
    pathId: number,
    baseObject: SceneObjectInterface,
  ): Promise<SceneObjectInterface> {
    const mods = this.getModificationEntry(nodeId, pathId);

    const object = await SceneObject.fromModifications(mods.modifications, baseObject)

    if (object === undefined) {
      throw new Error('object not defined')
    }

    object.modifierNode = this
    object.modifications = mods

    return object
  }

  addAddedNode(nodeId: number, pathId: number, addedNodeId: number) {
    const mods = this.getModificationEntry(nodeId, pathId)

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

  removeAddedNode(nodeId: number, pathId: number, addedNodeId: number) {
    const mods = this.getModificationEntry(nodeId, pathId)

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
