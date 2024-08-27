import { SceneNodeInterface, ParticleSystemInterface, ShaderRecord } from "../../Renderer/types";
import { GameObject2DInterface, SceneObjectInterface, GraphInterface, MaterialItemInterface, TextureInterface, SceneInterface, PrefabObjectInterface } from "../../State/types";

export type ItemLike = SceneObjectInterface | GameObject2DInterface | MaterialItemInterface | TextureInterface
  | GraphInterface | SceneNodeInterface | ParticleSystemInterface | ShaderRecord | MaterialItemInterface
  | SceneInterface | PrefabObjectInterface;

export interface ProjectInterface {
  selectedItem: ProjectItemInterface | null

  getItemByItemId(id: number, type: string): ProjectItemInterface | undefined
}

export type ProjectItemType = 'particle' | 'model' | 'shader' | 'texture' | 'material'
| 'object' | 'folder' | 'scene' | 'object2D' | 'prefab';

export interface ProjectItemInterface {
  id: number

  name: string

  type: ProjectItemType

  itemId: number | null

  parent: FolderInterface | null

  item: ItemLike | null

  changeName(name: string): Promise<void>

  delete(): Promise<void>

  getItem(): Promise<ItemLike | null>
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