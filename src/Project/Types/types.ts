import type { RenderNodeInterface, ParticleSystemInterface, ShaderRecord } from "../../Renderer/Types";
import type { GraphInterface } from "../../State/GraphInterface";
import type {
  GameObject2DInterface, MaterialItemInterface,
  TextureInterface,
} from "../../State/types";
import type { SceneNodeInterface } from "../../Scene/Types/Types";
import type { SceneInterface } from "../../Scene/Types/Types";
import type { PrefabInterface } from "../../Scene/Types/Types";

export type ProjectItemLike =
  ProjectItemInterface<SceneNodeInterface> |
  ProjectItemInterface<GameObject2DInterface> |
  ProjectItemInterface<MaterialItemInterface> |
  ProjectItemInterface<TextureInterface> |
  ProjectItemInterface<GraphInterface> |
  ProjectItemInterface<RenderNodeInterface> |
  ProjectItemInterface<ParticleSystemInterface> |
  ProjectItemInterface<ShaderRecord> |
  ProjectItemInterface<SceneInterface> |
  ProjectItemInterface<PrefabInterface> |
  ProjectItemInterface<FolderInterface>;

export enum ProjectItemType {
  Particle = 'particle',
  Model = 'model', 
  Shader = 'shader',
  Texture = 'texture',
  Material = 'material',
  SceneObject = 'object',
  Folder = 'folder',
  Scene = 'scene',
  Object2D = 'object2D',
  Prefab = 'prefab',
}

export interface ProjectInterface {
  selectedItem: ProjectItemLike | null

  getItemByItemId(id: number, type: string): ProjectItemLike | undefined
}

export interface ProjectItemInterface<T> {
  id: number

  name: string

  type: ProjectItemType

  itemId: number | null

  parent: FolderInterface | null

  item: T | null

  changeName(name: string): Promise<boolean>

  delete(): Promise<void>

  getItem(): Promise<T | null>
}

export const isSceneItem = (r: ProjectItemLike | null | undefined): r is ProjectItemInterface<SceneInterface> => (
  r !== null && r !== undefined
  && (r.type === ProjectItemType.Scene)
)

export const isPrefabItem = (r: ProjectItemLike | null | undefined): r is ProjectItemInterface<PrefabInterface> => (
  r !== null && r !== undefined
  && (r.type === ProjectItemType.Prefab)
)

export const isShaderItem = (r: ProjectItemLike | null | undefined): r is ProjectItemInterface<GraphInterface> => (
  r !== null && r !== undefined
  && (r.type === ProjectItemType.Shader)
)

export const isModelItem = (r: ProjectItemLike | null | undefined): r is ProjectItemInterface<RenderNodeInterface> => (
  r !== null && r !== undefined
  && (r.type === ProjectItemType.Model)
)

export interface FolderInterface extends ProjectItemInterface<FolderInterface> {
  items: ProjectItemLike[]

  newItemType: ProjectItemType | null
  
  open: boolean;

  toggleOpen(): void;

  addItem(item: ProjectItemLike): Promise<void>

  addItems(items: ProjectItemLike[]): void

  removeItem(item: ProjectItemLike): Promise<void>

  isAncestor(item: ProjectItemLike): boolean

  deleteItem(item: ProjectItemLike): Promise<void>
}

export const isFolder = (r: unknown): r is FolderInterface => (
  (r as FolderInterface).items !== undefined
)