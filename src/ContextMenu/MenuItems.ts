import { store } from "../State/store";
import Display from "../shaders/ShaderBuilder/Nodes/Display";
import Fraction from "../shaders/ShaderBuilder/Nodes/Fraction";
import Multiply from "../shaders/ShaderBuilder/Nodes/Multiply";
import SampleTexture from "../shaders/ShaderBuilder/Nodes/SampleTexture";
import TileAndScroll from "../shaders/ShaderBuilder/Nodes/TileAndScroll";
import Time from "../shaders/ShaderBuilder/Nodes/Time";
import UV from "../shaders/ShaderBuilder/Nodes/UV";
import Vector2D from "../shaders/ShaderBuilder/Nodes/Vector2D";
import PropertyNode from "../shaders/ShaderBuilder/PropertyNode";
import { GraphNodeInterface } from "../shaders/ShaderBuilder/Types";

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

function createObject<T>(o: new () => T, x: number, y: number) {
  const node = new o() as GraphNodeInterface;
  node.x = x;
  node.y = y;
  store.graph.addNode(node)  
}

export const propertyMenu = (): MenuItemLike[] => ( 
  store.graph.properties.map((p) => ({
    name: p.name, action: (x: number, y: number) => {
      const node = new PropertyNode(p)
      node.x = x;
      node.y = y;
      store.graph.addNode(node)  
    },
  }))
)

export const menuItems = (): MenuItemLike[] => ([
  { name: 'Properties', submenu: propertyMenu },
  { name: 'SampleTexture', action: (x: number, y: number) => createObject(SampleTexture, x, y) },
  { name: 'TileAndScroll', action: (x: number, y: number) => createObject(TileAndScroll, x, y) },
  { name: 'Display', action: (x: number, y: number) => createObject(Display, x, y) },
  { name: 'Fraction', action: (x: number, y: number) => createObject(Fraction, x, y) },
  { name: 'Multiply', action: (x: number, y: number) => createObject(Multiply, x, y) },
  { name: 'Time', action: (x: number, y: number) => createObject(Time, x, y) },
  { name: 'UV', action: (x: number, y: number) => createObject(UV, x, y) },
  { name: 'Vector2D', action: (x: number, y: number) => createObject(Vector2D, x, y) },
])
