export type MenuItemLike = MenuActionRecord | SubmenutItemRecord;

export type MenuItemRecord = {
  name: string,
}

export type MenuActionRecord = MenuItemRecord & {
  action: (x: number, y: number) => void,
}

export const isMenuActionRecord = (r: unknown): r is MenuActionRecord => (
  (r as MenuActionRecord).action !== undefined
)

export type SubmenutItemRecord = MenuItemRecord & {
  submenu: () => MenuItemLike[],
}

export const isSubmenuItem = (r: unknown): r is SubmenutItemRecord => (
  (r as SubmenutItemRecord).submenu !== undefined
)
