import { store } from "../State/store";
import Add from "../ShaderBuilder/Nodes/Add";
import Display from "../ShaderBuilder/Nodes/Display";
import Fraction from "../ShaderBuilder/Nodes/Fraction";
import Multiply from "../ShaderBuilder/Nodes/Multiply";
import SampleTexture from "../ShaderBuilder/Nodes/SampleTexture";
import TileAndScroll from "../ShaderBuilder/Nodes/TileAndScroll";
import Time from "../ShaderBuilder/Nodes/Time";
import UV from "../ShaderBuilder/Nodes/UV";
import Vector from "../ShaderBuilder/Nodes/Vector";
import PropertyNode from "../ShaderBuilder/PropertyNode";
import { GraphNodeInterface } from "../ShaderBuilder/Types";
import Value from "../ShaderBuilder/Value";

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

function addNode(node: GraphNodeInterface, x: number, y: number) {
  node.position = { x, y };
  store.graph.addNode(node)  
}

function createObject<T>(o: new () => T, x: number, y: number) {
  const node = new o() as GraphNodeInterface;
  addNode(node, x, y);
}

const propertyMenu = (): MenuItemLike[] => ( 
  store.graph.properties.map((p) => ({
    name: p.name, action: (x: number, y: number) => {
      const node = new PropertyNode(p)
      addNode(node, x, y);
    },
  }))
)

const values = (): MenuItemLike[] => (
  [2, 3, 4].map((v) => ({
    name: `vector${v}`,
    action: (x: number, y: number) => {
      const node = new Vector(new Value('vec2f', [0, 0]));
      addNode(node, x, y);
    },
  }))
)

export const menuItems = (): MenuItemLike[] => ([
  { name: 'Properties', submenu: propertyMenu },
  { name: 'Values', submenu: values },
  { name: 'SampleTexture', action: (x: number, y: number) => createObject(SampleTexture, x, y) },
  { name: 'TileAndScroll', action: (x: number, y: number) => createObject(TileAndScroll, x, y) },
  { name: 'Display', action: (x: number, y: number) => createObject(Display, x, y) },
  { name: 'Fraction', action: (x: number, y: number) => createObject(Fraction, x, y) },
  { name: 'Add', action: (x: number, y: number) => createObject(Add, x, y) },
  { name: 'Multiply', action: (x: number, y: number) => createObject(Multiply, x, y) },
  { name: 'Time', action: (x: number, y: number) => createObject(Time, x, y) },
  { name: 'UV', action: (x: number, y: number) => createObject(UV, x, y) },
])
