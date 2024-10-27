import SceneObject from './SceneObject'
import {
  type AddedNode, type SceneObjectDescriptor, type SceneObjectInterface,
  type TreeModifierDescriptor,
} from './Types'

type NodeId = number
type PathId = number

class ModifierNode {
  id: number

  rootNodeId: number

  addedNodes: AddedNode[] = []

  objects: Map<NodeId, Map<PathId, { descriptor?: SceneObjectDescriptor, object?: SceneObjectInterface }>> = new Map()

  constructor(descriptor: TreeModifierDescriptor) {
    this.id = descriptor.id
    this.rootNodeId = descriptor.rootNodeId
    this.addedNodes = [...descriptor.addedNodes]
  }

  async getObject(
    nodeId: number,
    pathId: number,
    baseObject: SceneObjectInterface,
  ): Promise<SceneObjectInterface> {
    let pathMap = this.objects.get(nodeId)

    if (pathMap === undefined) {
      pathMap = new Map()
      this.objects.set(nodeId, pathMap)
    }

    let o = pathMap.get(pathId)

    if (o === undefined) {
      o = { descriptor: undefined, object: undefined }
      pathMap.set(pathId, o)
    }

    if (o.object === undefined) {
      o.object = await SceneObject.fromDescriptor(o.descriptor, undefined, baseObject)
    }

    if (o.object === undefined) {
      throw new Error('object not defined')
    }

    o.object.modifierNode = this

    return o.object
  }
}

export const isModifierNode = (r: unknown): r is ModifierNode => (
  (r as ModifierNode)?.rootNodeId !== undefined
)

export default ModifierNode
