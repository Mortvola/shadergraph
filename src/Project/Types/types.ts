import type { RenderNodeInterface, ParticleSystemInterface, ShaderRecord } from "../../Renderer/Types";
import type { GraphInterface } from "../../State/GraphInterface";
import type {
  GameObject2DInterface, MaterialItemInterface,
  ModelItemInterface,
  TextureInterface,
} from "../../State/types";
import type { SceneObjectInterface } from "../../Scene/Types/Types";
import type { SceneInterface } from "../../Scene/Types/Types";
import type TreeNode from "../../Scene/Types/TreeNode";

export type ProjectItemLike =
  ProjectItemInterface<SceneObjectInterface> |
  ProjectItemInterface<GameObject2DInterface> |
  ProjectItemInterface<MaterialItemInterface> |
  ProjectItemInterface<TextureInterface> |
  ProjectItemInterface<GraphInterface> |
  ProjectItemInterface<ModelItemInterface> |
  ProjectItemInterface<ParticleSystemInterface> |
  ProjectItemInterface<ShaderRecord> |
  ProjectItemInterface<SceneInterface> |
  ProjectItemInterface<FolderInterface> |
  ProjectItemInterface<TreeNode>;

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
  TreeNode = 'tree-node',
}

export interface ProjectInterface {
  projectItems: FolderInterface | null

  selectedItem: ProjectItemLike | null

  getFolder(folder: FolderInterface): void;

  getItemByItemId(id: number, type: string): ProjectItemLike | undefined;

  createNewItem(
    name: string,
    type: ProjectItemType,
    folder: FolderInterface,
    payload?: unknown,
  ): Promise<ProjectItemLike | undefined>

  cancelNewItem(folder: FolderInterface): void;
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

export const isShaderItem = (r: ProjectItemLike | null | undefined): r is ProjectItemInterface<GraphInterface> => (
  r !== null && r !== undefined
  && (r.type === ProjectItemType.Shader)
)

export const isModelItem = (r: ProjectItemLike | null | undefined): r is ProjectItemInterface<ModelItemInterface> => (
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