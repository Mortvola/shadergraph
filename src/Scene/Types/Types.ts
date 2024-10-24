import { type ProjectItemType } from '../../Project/Types/types';
import type { ParticleSystemPropsDescriptor } from '../../Renderer/ParticleSystem/Types';
import type { PropertyBaseInterface } from '../../Renderer/Properties/Types';
import type {
  ComponentDescriptor, LightPropsDescriptor, NewSceneObjectComponent,
  SceneObjectComponent as SceneObjectComponent, TransformPropsInterface,
} from '../../Renderer/Types';
import type ModifierNode from './ModifierNode';
import type TreeNode from './TreeNode';

export enum SceneItemType {
  SceneObject = 'SceneObject',
  ParticleSystem = 'ParticleSystem',
  Light = 'Light',
}

export type PrefabDescriptor = {
  id: number;
  name: string;
  prefab: {
    root?: PrefabNodeDescriptor;
  };
};

export type PrefabNodeDescriptor = {
  id: number;
  name: string;
  components: ComponentDescriptor[];
  transformProps?: TransformPropsDescriptor;
  nodes: PrefabNodeDescriptor[];
};

export type TreeId = number;

export type NodeInfo = {
  treeNodes: Map<TreeId | undefined, TreeNode>,
  objects: Map<TreeId | undefined, SceneObjectInterface>,
}

export interface SceneInterface {
  root: TreeNode | undefined;

  tempRoot: TreeNode | undefined;

  selectedNode: TreeNode | null;

  draggingNode: TreeNode | null;

  nodeMaps: Map<number, NodeInfo>

  nodes: Map<number, TreeNodeDescriptor | ModifierNode>

  objects: Map<number, { descriptor: SceneObjectDescriptor, object?: SceneObjectInterface }>

  createNode(
    id: number,
    name: string,
    object?: SceneObjectInterface,
    modifierNode?: ModifierNode,
    parentModifierNode?: TreeNode,
    parent?: TreeNode,
  ): TreeNode

  createTree(rootNodeId: number, parent?: TreeNode): Promise<TreeNode | undefined>;

  addNode(node: TreeNode, autosave: boolean): void;

  setSelected(node: TreeNode | null): void;

  renderScene(): void;

  removeScene(): void;

  addNewItem(type: SceneItemType): void;
}

export const isTreeNode = (r: unknown): r is TreeNode => (
  (r as TreeNode)?.renderNode !== undefined
  && (r as TreeNode)?.nodeObject !== undefined
  && (r as TreeNode)?.nodes !== undefined
  && (r as TreeNode)?.components !== undefined
)

export interface SceneObjectInterface {
  components: SceneObjectComponent[];

  transformProps: TransformPropsInterface;

  node?: TreeNode;

  modifierNode?: ModifierNode;

  baseObject?: SceneObjectInterface;

  tree?: { id: number, name: string };

  addComponent(component: NewSceneObjectComponent): void;

  removeComponent(component: SceneObjectComponent): void;

  detachSelf(): void;

  isPrefabInstanceRoot(): boolean;

  save(): Promise<void>;

  getNextComponentId(): number;

  get hasOverrides(): boolean;
}

export const isGameObject = (r: unknown): r is SceneObjectInterface => (
  r !== undefined && r !== null &&
  (r as SceneObjectInterface).components !== undefined
)

export type SceneObjectDescriptor = {
  nodeId: number,
  modifierNodeId?: number,
  pathId?: number,

  object: {
    type: ObjectType,
    components: ComponentDescriptor[],
    transformProps: TransformPropsDescriptor,
  },

  baseTreeId?: number,

  rootId?: number,
}

export type ConnectedObject = { prefabNodeId: number, objectId: number }

export type PrefabInstanceDescriptor = {
  id: number;
  name: string;
  object: {
    prefabId: number;
    nodes?: PrefabInstanceNodeDesriptor[];
    connectedObjects?: ConnectedObject[]
  };
}

export type PrefabInstanceNodeDesriptor = {
  id: number;
  components: ComponentDescriptor[];
  transformProps?: TransformPropsDescriptor;
}

export const isPrefabInstanceDescriptor = (r: unknown): r is PrefabInstanceDescriptor => (
  r !== undefined && r !== undefined
  && (r as PrefabInstanceDescriptor).object?.prefabId !== undefined
)

export type PrefabPropsDescriptor = ParticleSystemPropsDescriptor | LightPropsDescriptor;

export type ConnectedObjectOverride = { connectedObject: SceneObjectInterface };
export type PropertyOverride = { property: PropertyBaseInterface };

export const isPropertyOverride = (r: unknown): r is PropertyOverride => (
  (r as PropertyOverride).property !== undefined
)

export type ObjectOverrides = {
  object: SceneObjectInterface,
  overrides: (ConnectedObjectOverride | PropertyOverride)[],
}

export type SceneDescriptor = {
  id: number;
  name: string;
  rootNodeId: number;
}

export type TransformPropsDescriptor = {
  translate?: number[];
  rotate?: number[];
  scale?: number[];
};

export enum ObjectType {
  NodeObject = 'Object',
  TreeNode = 'TreeNode',
  Tree = 'Tree',
  TreeInstance = 'TreeInstance',
  NodeObjectOverride = 'ObjectOverride',
}

// export type TreeNodeDescriptor = {
//   id: number,
//   name: string,
//   wrapperId?: number,
//   parentWrapperId?: number,
//   pathId?: number,
//   path?: number[],
//   children: TreeNodeDescriptor[],
// }

export type AddedNode = {
  nodeId: number,
  parentNodeId: number,
  pathId: number,
}

export type TreeModifierDescriptor = {
  id: number,
  rootNodeId: number,
  addedNodes: AddedNode[],
}

export const isTreeModifierDescriptor = (r: unknown): r is TreeModifierDescriptor => (
  (r as TreeModifierDescriptor).rootNodeId !== undefined
)

export type TreeNodeDescriptor = {
  id: number,
  name: string,
  parentNodeId?: number,
  modifierNodeId?: number,
  children?: number[],
}

export const isTreeNodeDescriptor = (r: unknown): r is TreeNodeDescriptor => (
  (r as TreeModifierDescriptor)?.rootNodeId === undefined
)

export const isSceneObjectDescriptor = (r: unknown): r is SceneObjectDescriptor => (
  (r as SceneObjectDescriptor)?.object?.type === ObjectType.NodeObject
)

// export type NodesResponse = {
//   root: TreeNodeDescriptor,
//   objects: SceneObjectDescriptor[],
//   trees: { id: number, name: string}[],
// }

export type NodesResponse2 = {
  rootNodeId: number,
  nodes: (TreeNodeDescriptor | TreeModifierDescriptor)[],
  objects: SceneObjectDescriptor[],
}

export type ItemResponse = {
  item: {
    id: number,
    name: string,
    type: ProjectItemType,
  },
  // root?: TreeNodeDescriptor,
  objects?: SceneObjectDescriptor[],
}

