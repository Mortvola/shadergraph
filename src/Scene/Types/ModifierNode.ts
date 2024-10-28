import SceneObject from './SceneObject'
import {
  type ModificationEntry,
  type AddedNode, type SceneObjectInterface,
  type TreeModifierDescriptor,
} from './Types'

type NodeId = number
type PathId = number

class ModifierNode {
  id: number

  rootNodeId: number

  addedNodes: AddedNode[] = []

  modifications: Map<NodeId, Map<PathId, ModificationEntry>> = new Map()

  constructor(descriptor: TreeModifierDescriptor) {
    this.id = descriptor.id
    this.rootNodeId = descriptor.rootNodeId
    this.addedNodes = [...descriptor.addedNodes]

    for (const mod of descriptor.modifications) {
      let pathMap = this.modifications.get(mod.nodeId)

      if (pathMap === undefined) {
        pathMap = new Map()
        this.modifications.set(mod.nodeId, pathMap)
      }

      pathMap.set(mod.pathId, mod)
    }
  }

  async getObject(
    nodeId: number,
    pathId: number,
    baseObject: SceneObjectInterface,
  ): Promise<SceneObjectInterface> {
    let pathMap = this.modifications.get(nodeId)

    if (pathMap === undefined) {
      pathMap = new Map()
      this.modifications.set(nodeId, pathMap)
    }

    let mods = pathMap.get(pathId)

    if (mods === undefined) {
      mods = { nodeId, pathId, modifications: {} }
      pathMap.set(pathId, mods)
    }

    const object = await SceneObject.fromModifications(mods.modifications, baseObject)

    if (object === undefined) {
      throw new Error('object not defined')
    }

    object.modifierNode = this
    object.modifications = mods

    return object
  }
}

export const isModifierNode = (r: unknown): r is ModifierNode => (
  (r as ModifierNode)?.rootNodeId !== undefined
)

export default ModifierNode
