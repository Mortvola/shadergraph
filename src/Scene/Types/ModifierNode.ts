import {
  type AddedNode, type SceneObjectDescriptor, type SceneObjectInterface,
  type TreeModifierDescriptor,
} from './Types'

class ModifierNode {
  id: number

  rootNodeId: number

  addedNodes: AddedNode[] = []

  objects: Map<number, { descriptor: SceneObjectDescriptor, object?: SceneObjectInterface }> = new Map()

  constructor(descriptor: TreeModifierDescriptor) {
    this.id = descriptor.id
    this.rootNodeId = descriptor.rootNodeId
    this.addedNodes = [...descriptor.addedNodes]
  }
}

export const isModifierNode = (r: unknown): r is ModifierNode => (
  (r as ModifierNode)?.rootNodeId !== undefined
)

export default ModifierNode
