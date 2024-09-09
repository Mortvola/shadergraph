import type { ParticleSystemPropsDescriptor } from "../../Renderer/ParticleSystem/Types";
import type { PropertyBaseInterface } from "../../Renderer/Properties/Types";
import type {
  ComponentDescriptor, LightPropsDescriptor, NewSceneNodeComponent,
  RenderNodeInterface, SceneNodeComponent, TransformPropsInterface,
} from "../../Renderer/Types";
import type { EntityInterface } from "../../State/types";

export interface PrefabInterface {
  id: number;

  name: string;

  root?: PrefabNodeInterface;

  autosave: boolean;

  addSceneNodes(startingObject: SceneNodeInterface, id: number, parentNode: PrefabNodeInterface | null): PrefabNodeInterface;

  toDescriptor(): PrefabDescriptor;

  save(): Promise<void>;
}

export interface PrefabNodeInterface {
  id: number;

  name: string;

  components: SceneNodeComponent[];

  nodes: PrefabNodeInterface[];

  transformProps: TransformPropsInterface;

  prefab: PrefabInterface;

  toDescriptor(): PrefabNodeDescriptor;
}

export type PrefabDescriptor = {
  id: number;
  name: string;
  prefab: {
    root?: PrefabNodeDescriptor;
  };
};

export interface PrefabNodeInstanceInterface extends SceneNodeBaseInterface {
  baseNode: PrefabNodeInterface;

}

export type PrefabNodeDescriptor = {
  id: number;
  name: string;
  components: ComponentDescriptor[];
  transformProps?: TransformPropsDescriptor;
  nodes: PrefabNodeDescriptor[];
};

export interface SceneInterface {
  name: string;

  selectedObject: SceneNodeBaseInterface | null;

  rootObject: SceneNodeInterface | PrefabNodeInstanceInterface;

  draggingItem: SceneNodeBaseInterface | null;

  addObject(object: SceneNodeInterface): void;

  setSelectedObject(object: SceneNodeBaseInterface): void;

  renderScene(): Promise<void>;
}

export interface SceneNodeBaseInterface extends EntityInterface {
  components: SceneNodeComponent[];

  nodes: SceneNodeBaseInterface[];

  transformProps: TransformPropsInterface;

  parent: SceneNodeBaseInterface | null;

  renderNode: RenderNodeInterface;

  addObject(object: SceneNodeBaseInterface): void;

  removeObject(object: SceneNodeBaseInterface): void;

  addComponent(component: NewSceneNodeComponent): void;

  removeComponent(component: SceneNodeComponent): void;

  isAncestor(item: SceneNodeBaseInterface): boolean;

  changeName(name: string): void;

  detachSelf(): void;

  delete(): Promise<void>;

  isPrefabInstanceRoot(): boolean;
}

export const isSceneNode = (r: unknown): r is SceneNodeInterface => (
  r !== null && r !== undefined
  && (r as PrefabNodeInstanceInterface).baseNode === undefined
)

export interface SceneNodeInterface extends SceneNodeBaseInterface {
  components: SceneNodeComponent[];

  save(): Promise<void>;

  getNextComponentId(): number;
}

export const isGameObject = (r: unknown): r is SceneNodeInterface => (
  r !== undefined && r !== null &&
  (r as SceneNodeInterface).components !== undefined
)

export type SceneNodeDescriptor = {
  id: number;
  name: string;
  object: {
    components: ComponentDescriptor[];
    transformProps: TransformPropsDescriptor;
    nodes: number[];
  };
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

export type CconnectedObjectOverride = { connectedObject: SceneNodeBaseInterface };
export type PropertyOverride = { property: PropertyBaseInterface };

export const isPropertyOverride = (r: unknown): r is PropertyOverride => (
  (r as PropertyOverride).property !== undefined
)

export type ObjectOverrides = {
  object: SceneNodeBaseInterface,
  overrides: (CconnectedObjectOverride | PropertyOverride)[],
}

export interface PrefabInstanceInterface {
  id: number;

  autosave: boolean;

  root?: PrefabNodeInstanceInterface

  save(): Promise<void>;

  getOverrides(): ObjectOverrides[];

  attachSceneNode(
    sceneNode: SceneNodeBaseInterface,
  ): Promise<void>
}

export type SceneDescriptor = {
  id?: number;
  name: string;
  scene: {
    objects: number;
  };
}

export type TransformPropsDescriptor = {
  translate?: number[];
  rotate?: number[];
  scale?: number[];
};

export type TransformPropsOverrides = Partial<TransformPropsDescriptor>;
