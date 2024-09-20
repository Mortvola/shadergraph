import { type ProjectItemType } from "../../Project/Types/types";
import type { ParticleSystemPropsDescriptor } from "../../Renderer/ParticleSystem/Types";
import type { PropertyBaseInterface } from "../../Renderer/Properties/Types";
import type {
  ComponentDescriptor, LightPropsDescriptor, NewSceneObjectComponent,
  SceneObjectComponent as SceneObjectComponent, TransformPropsInterface,
} from "../../Renderer/Types";
import type { EntityInterface } from "../../State/types";
import type TreeNode from "./TreeNode";

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

export interface SceneInterface {
  root: TreeNode | undefined;

  selectedNode: TreeNode | null;

  draggingNode: TreeNode | null;

  addNode(node: TreeNode, autosave: boolean): void;

  setSelectedObject(node: TreeNode | null): void;

  renderScene(): Promise<void>;

  addNewItem(type: SceneItemType): void;
}

export const isTreeNode = (r: unknown): r is TreeNode => (
  (r as TreeNode)?.renderNode !== undefined
  && (r as TreeNode)?.nodeObject !== undefined
  && (r as TreeNode)?.nodes !== undefined
  && (r as TreeNode)?.components !== undefined
)

export interface SceneObjectInterface extends EntityInterface {
  components: SceneObjectComponent[];

  transformProps: TransformPropsInterface;

  addComponent(component: NewSceneObjectComponent): void;

  removeComponent(component: SceneObjectComponent): void;

  changeName(name: string): void;

  detachSelf(): void;

  delete(): Promise<void>;

  isPrefabInstanceRoot(): boolean;

  save(): Promise<void>;

  getNextComponentId(): number;
}

export const isGameObject = (r: unknown): r is SceneObjectInterface => (
  r !== undefined && r !== null &&
  (r as SceneObjectInterface).components !== undefined
)

export type SceneObjectDescriptor = {
  id: number,
  name: string,
  object: {
    type: ObjectType,
    components: ComponentDescriptor[],
    transformProps: TransformPropsDescriptor,
  },
  baseObjectId?: number,
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

// export interface PrefabInstanceInterface {
//   id: number;

//   autosave: boolean;

//   root?: PrefabNodeInstanceInterface

//   save(): Promise<void>;

//   getOverrides(): ObjectOverrides[];

//   attachSceneObject(
//     sceneNode: SceneObjectBaseInterface,
//   ): Promise<void>
// }

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

// export type NodeObjectDescriptor = {
//   id: number,
//   type: ObjectType,
//   components: ComponentDescriptor[];
//   transformProps?: TransformPropsDescriptor;
// }

// export class NodeObject {

// }

export type TreeNodeDescriptor = {
  id: number,
  treeId: number,
  parentNodeId: number,
  // subtreeId: number,
  object?: SceneObjectDescriptor,
  children?: TreeNodeDescriptor[],
  // object: {
  //   type: ObjectType,
  //   nodes: number[] // Can be a TreeNode or a TreeInstance.
  //   objectId: number,
  // }
}

export type TreeDescriptor = {
  id: number,
  name: string,
  object: {
    type: ObjectType,
    root: number // References a TreeNode  
  }
}

export type NodeObjectOverride = {
  id: number,
  type: ObjectType,
  baseNodeId: number, // Can be a NodeObjectOverride or a NodeObject
  components: ComponentDescriptor[];
  transformProps?: TransformPropsDescriptor;
  connections: number[], // Can be a TreeNode or a TreeInstance
}

export type TreeInstance = {
  tree: number,
  type: ObjectType,
  nodes: number[], // Array of NodeObjectOverride ids.
}

export const isTreeDescriptor = (r: unknown): r is TreeDescriptor => (
  (r as TreeDescriptor)?.object?.type === ObjectType.Tree
)

export const isTreeNodeDescriptor = (r: unknown): r is TreeNodeDescriptor => (
  // (r as TreeNodeDescriptor)?.object?.type === ObjectType.TreeNode
  true
)

export const isSceneObjectDescriptor = (r: unknown): r is SceneObjectDescriptor => (
  (r as SceneObjectDescriptor)?.object?.type === ObjectType.NodeObject
)

export type TreeNodeDescriptor2 = {
  id: number,
  treeId?: number,
  objectId: number,
  children: TreeNodeDescriptor2[],
}

export type NodesResponse = { root: TreeNodeDescriptor2, objects: SceneObjectDescriptor[] }

export type ItemResponse = {
  item: {
    id: number,
    name: string,
    type: ProjectItemType,
  },
  root?: TreeNodeDescriptor2,
  objects?: SceneObjectDescriptor[],
}

