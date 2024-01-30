import { GameObjectInterface } from "../../State/types";

export interface ProjectItemInterface {
  id: number

  name: string

  type: string

  itemId: number | null

  parent: FolderInterface | null

  item: GameObjectInterface | null

  changeName(name: string): Promise<void>
}

export interface FolderInterface extends ProjectItemInterface {
  items: ProjectItemInterface[]

  addItem(item: ProjectItemInterface): Promise<void>

  addItems(items: ProjectItemInterface[]): void

  removeItem(item: ProjectItemInterface): Promise<void>

  isAncestor(item: ProjectItemInterface): boolean
}

export const isFolder = (r: unknown): r is FolderInterface => (
  (r as FolderInterface).items !== undefined
)