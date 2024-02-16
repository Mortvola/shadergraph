import { ParticleSystemInterface, SceneNodeInterface, ShaderRecord } from "../../Renderer/types";
import { GameObject2DInterface, GameObjectInterface, GraphInterface, MaterialItemInterface, TextureInterface } from "../../State/types";

export type ItemLike = GameObjectInterface | GameObject2DInterface | MaterialItemInterface | TextureInterface
  | GraphInterface | SceneNodeInterface | ParticleSystemInterface | ShaderRecord;

export interface ProjectInterface {
  selectedItem: ProjectItemInterface | null

  getItemByItemId(id: number, type: string): ProjectItemInterface | undefined
}

export interface ProjectItemInterface {
  id: number

  name: string

  type: string

  itemId: number | null

  parent: FolderInterface | null

  item: ItemLike | null

  changeName(name: string): Promise<void>

  delete(): Promise<void>

  getItem<T>(): T | null
}

export interface FolderInterface extends ProjectItemInterface {
  items: ProjectItemInterface[]

  newItem: string | null
  
  addItem(item: ProjectItemInterface): Promise<void>

  addItems(items: ProjectItemInterface[]): void

  removeItem(item: ProjectItemInterface): Promise<void>

  isAncestor(item: ProjectItemInterface): boolean

  deleteItem(item: ProjectItemInterface): Promise<void>
}

export const isFolder = (r: unknown): r is FolderInterface => (
  (r as FolderInterface).items !== undefined
)