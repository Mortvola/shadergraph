import { type FolderInterface, type ProjectItemType } from '../../Project/Types/types';
import type { ParticleSystemPropsDescriptor } from '../../Renderer/ParticleSystem/Types';
import { type PSString } from '../../Renderer/Properties/Property';
import type { PropertyBaseInterface } from '../../Renderer/Properties/Types';
import type {
  ComponentDescriptor, ComponentPropsDescriptor, ComponentType, LightPropsDescriptor,
  SceneObjectComponent as SceneObjectComponent,
} from '../../Renderer/Types';
import type TreeNode from './TreeNode';
import type PropsBase from '../../Renderer/Properties/PropsBase';

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

export type SceneId = number;
export type NodeId = number;

export interface SceneInterface {
  id: number;

  root: TreeNode | undefined;

  rootStack: TreeNode[];

  selectedNode: TreeNode | null;

  draggingNode: TreeNode | null;

  getObject(id: number): SceneObjectInterface | undefined

  processModifications(modifications: (ModificationEntry & { sceneId: number, nodeId: number })[]): void

  createTree(rootNodeId: number, rootSceneId: number, parent?: TreeNode): Promise<TreeNode | undefined>;

  pushTree(nodeId: number, sceneId: number): Promise<void>

  popTree(): Promise<void>

  createPrefab(node: TreeNode, folder: FolderInterface): Promise<void>;

  instantiatePrefab(sceneId: number, parent: TreeNode): Promise<void>;

  addChild(
    component: { type: ComponentType, props: PropsBase } | undefined,
    name: string,
    parent: TreeNode,
  ): Promise<TreeNode | undefined>

  removeNode(node: TreeNode): void;

  setSelected(node: TreeNode | null): void;

  renderScene(): void;

  removeScene(): void;

  addNewItem(type: SceneItemType): void;

  updateObjectComponent(
    sceneObjectId: number,
    type: ComponentType,
    descriptor: ComponentPropsDescriptor,
  ): Promise<void>;

  getApplyTargets(
    node: TreeNode,
    componentType: ComponentType,
    propertyPath?: string,
  ): { label: string, action: () => void, }[];
}

export const isTreeNode = (r: unknown): r is TreeNode => (
  (r as TreeNode)?.renderNode !== undefined
  && (r as TreeNode)?.sceneObject !== undefined
  && (r as TreeNode)?.children !== undefined
  // && (r as TreeNode)?.components !== undefined
)

export interface HeaderInterface {
  name: PSString
}

export type SceneObjectComponents = Record<string, SceneObjectComponent>

export interface SceneObjectInterface {
  id: number

  name: PSString;

  components: SceneObjectComponents;

  node?: TreeNode;

  autosave: boolean;

  get isTopLevel(): boolean;

  applyModifications(modifications: SceneObjectModifications, override: boolean): void;

  updateComponent(
    componentType: ComponentType,
    componentDescriptor: ComponentPropsDescriptor | string,
    override: boolean,
  ): void;

  addComponent(componentType: ComponentType, component: SceneObjectComponent): void;

  removeComponent(componentType: ComponentType, component: SceneObjectComponent): void;

  isPrefabInstanceRoot(): boolean;

  get hasOverrides(): boolean;

  toDescriptor(overridesOnly: boolean): SceneObjectDescriptor | { name?: string };
}

export const isGameObject = (r: unknown): r is SceneObjectInterface => (
  r !== undefined && r !== null &&
  (r as SceneObjectInterface).components !== undefined
)

export type SceneObjectDescriptor = {
  id: number,
  name: string,
  components: string[],
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
  id: number,
  name: string,
  rootNodeId: number,
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

export type SceneObjectModifications = Record<string, Record<string, unknown> | string | undefined>

export type ModificationEntry = {
  pathId: number,
  sceneObject: SceneObjectModifications,
  addedNodes: number[],
}

export type TreeModifierDescriptor = {
  id: number,
  sceneId: number,
  rootNodeId: number,
  rootSceneId: number,
  modifications: ModificationEntry[],
}

export const isTreeModifierDescriptor = (r: unknown): r is TreeModifierDescriptor => (
  (r as TreeModifierDescriptor).rootNodeId !== undefined
)

export type TreeNodeDescriptor = {
  id: number,
  sceneId: number,
  sceneObjectId: number,
  children?: number[],
}

export const isTreeNodeDescriptor = (r: unknown): r is TreeNodeDescriptor => (
  (r as TreeModifierDescriptor)?.rootNodeId === undefined
)

export type NodesResponse2 = {
  root: {
    id: number,
    sceneId: number,
  }
  nodes: (TreeNodeDescriptor | TreeModifierDescriptor)[],
  objects: SceneObjectDescriptor[],
  components: ComponentDescriptor[],
  modifications?: (ModificationEntry & { sceneId: number, nodeId: number })[],
  deletedNodes?: { id: number, sceneId: number }[],
}

export type ItemResponse = {
  item: {
    id: number,
    name: string,
    type: ProjectItemType,
  },
} & NodesResponse2

