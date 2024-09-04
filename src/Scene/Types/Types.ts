import type { ParticleSystemPropsDescriptor } from "../../Renderer/ParticleSystem/Types";
import type {
  ComponentDescriptor, ComponentType, LightPropsDescriptor, NewSceneObjectComponent,
  PrefabComponent, SceneNodeInterface, SceneObjectComponent, TransformPropsInterface,
} from "../../Renderer/Types";
import { EntityInterface, TransformPropsDescriptor } from "../../State/types";

export interface PrefabInterface {
  id: number;

  name: string;

  root?: PrefabNodeInterface;

  autosave: boolean;

  toDescriptor(): PrefabDescriptor;

  save(): Promise<void>;
}

export interface PrefabNodeInterface {
  id: number;

  name: string;

  components: PrefabComponent[];

  nodes: PrefabNodeInterface[];

  transformProps: TransformPropsInterface;

  prefab: PrefabInterface;

  ancestor?: PrefabNodeInterface;

  toDescriptor(): PrefabNodeDescriptor;
}

export type PrefabDescriptor = {
  id: number;
  name: string;
  prefab: {
    root?: PrefabNodeDescriptor;
  };
};

export interface PrefabInstanceObjectInterface extends SceneObjectBaseInterface {
  ancestor: PrefabNodeInterface;

}

export type PrefabNodeDescriptor = {
  id: number;
  name: string;
  components: PrefabComponentDescriptor[];
  transformProps?: TransformPropsDescriptor;
  nodes: PrefabNodeDescriptor[];
};

export interface SceneInterface {
  name: string;

  selectedObject: SceneObjectBaseInterface | null;

  rootObject: SceneObjectInterface | PrefabInstanceObjectInterface;

  draggingItem: SceneObjectBaseInterface | null;

  addObject(object: SceneObjectInterface): void;

  setSelectedObject(object: SceneObjectBaseInterface): void;

  renderScene(): Promise<void>;
}

export interface SceneObjectBaseInterface extends EntityInterface {
  components: SceneObjectComponent[];

  objects: SceneObjectBaseInterface[];

  transformProps: TransformPropsInterface;

  parent: (SceneObjectBaseInterface | SceneObjectInterface | PrefabInstanceObjectInterface) | null;

  sceneNode: SceneNodeInterface;

  addObject(object: SceneObjectBaseInterface): void;

  removeObject(object: SceneObjectBaseInterface): void;

  addComponent(component: NewSceneObjectComponent): void;

  removeComponent(component: SceneObjectComponent): void;

  isAncestor(item: SceneObjectBaseInterface): boolean;

  changeName(name: string): void;

  detachSelf(): void;

  delete(): void;
}

export const isSceneObject = (r: unknown): r is SceneObjectInterface => (
  r !== null && r !== undefined
  && (r as PrefabInstanceObjectInterface).ancestor === undefined
)

export interface SceneObjectInterface extends SceneObjectBaseInterface {
  components: SceneObjectComponent[];

  save(): Promise<void>;

  delete(): void;

  getNextComponentId(): number;
}

export const isGameObject = (r: unknown): r is SceneObjectInterface => (
  r !== undefined && r !== null &&
  (r as SceneObjectInterface).components !== undefined
)

export type SceneObjectDescriptor = {
  id: number;
  name: string;
  object: {
    translate?: number[];
    rotate?: number[];
    scale?: number[];
    components?: ComponentDescriptor[];
    items?: ComponentDescriptor[];
    objects?: number[];
    nextComponentId?: number;
  };
}

export type PrefabInstanceDescriptor = {
  id: number;
  name: string;
  object: {
    prefabId: number;
    nodes?: PrefabInstanceNodeDesriptor[];
  };
}

export type PrefabInstanceNodeDesriptor = {
  id: number;
  components: PrefabComponentDescriptor[];
  transformProps?: TransformPropsDescriptor;
}

export const isPrefabInstanceDescriptor = (r: unknown): r is PrefabInstanceDescriptor => (
  r !== undefined && r !== undefined
  && (r as PrefabInstanceDescriptor).object?.prefabId !== undefined
)

export type PrefabComponentDescriptor = {
  id: number;
  type: ComponentType;
  props?: PrefabPropsDescriptor;
}

export type PrefabPropsDescriptor = ParticleSystemPropsDescriptor | LightPropsDescriptor;

export interface PrefabInstanceInterface {
  id: number;

  autosave: boolean;

  save(): Promise<void>;

  delete(): Promise<void>;
}

export type SceneDescriptor = {
  id?: number;
  name: string;
  scene: {
    objects: number;
  };
}