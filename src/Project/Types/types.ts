import { SceneNodeInterface, ParticleSystemInterface, ShaderRecord } from "../../Renderer/types";
import {
  GameObject2DInterface, SceneObjectInterface, GraphInterface, MaterialItemInterface,
  TextureInterface, SceneInterface, PrefabObjectInterface,
} from "../../State/types";

export type ProjectItemLike = SceneObjectInterface | GameObject2DInterface | MaterialItemInterface | TextureInterface
  | GraphInterface | SceneNodeInterface | ParticleSystemInterface | ShaderRecord | MaterialItemInterface
  | SceneInterface | PrefabObjectInterface;

export enum ProjectItemType {
  Particle = 'particle',
  Model = 'model', 
  Shader = 'shader',
  Texture = 'texture',
  Material = 'material',
  Object = 'object',
  Folder = 'folder',
  Scene = 'scene',
  Object2D = 'object2D',
  Prefab = 'prefab',
}

export interface ProjectInterface {
  selectedItem: ProjectItemInterface | null

  getItemByItemId(id: number, type: string): ProjectItemInterface | undefined
}

export interface ProjectItemInterface {
  id: number

  name: string

  type: ProjectItemType

  itemId: number | null

  parent: FolderInterface | null

  item: ProjectItemLike | null

  changeName(name: string): Promise<void>

  delete(): Promise<void>

  getItem<T>(): Promise<T | null>
}

export interface FolderInterface extends ProjectItemInterface {
  items: ProjectItemInterface[]

  newItemType: ProjectItemType | null
  
  open: boolean;

  toggleOpen(): void;

  addItem(item: ProjectItemInterface): Promise<void>

  addItems(items: ProjectItemInterface[]): void

  removeItem(item: ProjectItemInterface): Promise<void>

  isAncestor(item: ProjectItemInterface): boolean

  deleteItem(item: ProjectItemInterface): Promise<void>
}

export const isFolder = (r: unknown): r is FolderInterface => (
  (r as FolderInterface).items !== undefined
)