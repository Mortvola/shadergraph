import { SceneNodeInterface } from "../../Renderer/types";
import { GameObjectInterface, GraphInterface, MaterialInterface, TextureInterface } from "../../State/types";

export type ItemLike = GameObjectInterface | MaterialInterface | TextureInterface | GraphInterface | SceneNodeInterface;

export interface ProjectItemInterface {
  id: number

  name: string

  type: string

  itemId: number | null

  parent: FolderInterface | null

  item: ItemLike | null

  changeName(name: string): Promise<void>

  delete(): Promise<void>
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