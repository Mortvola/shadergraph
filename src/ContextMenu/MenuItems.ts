import { store } from "../State/store";
import Add from "../Renderer/ShaderBuilder/Nodes/Add";
import Display from "../Renderer/ShaderBuilder/Nodes/Display";
import Fraction from "../Renderer/ShaderBuilder/Nodes/Fraction";
import Multiply from "../Renderer/ShaderBuilder/Nodes/Multiply";
import SampleTexture from "../Renderer/ShaderBuilder/Nodes/SampleTexture";
import TileAndScroll from "../Renderer/ShaderBuilder/Nodes/TileAndScroll";
import Time from "../Renderer/ShaderBuilder/Nodes/Time";
import UV from "../Renderer/ShaderBuilder/Nodes/UV";
import Vector from "../Renderer/ShaderBuilder/Nodes/Vector";
import PropertyNode from "../Renderer/ShaderBuilder/PropertyNode";
import { GraphNodeInterface } from "../Renderer/ShaderBuilder/Types";
import Value from "../Renderer/ShaderBuilder/Value";
import PhongShading from "../Renderer/ShaderBuilder/Nodes/PhongShading";
import Combine from "../Renderer/ShaderBuilder/Nodes/Combine";
import Split from "../Renderer/ShaderBuilder/Nodes/Split";
import Twirl from "../Renderer/ShaderBuilder/Nodes/Twirl";
import Voronoi from "../Renderer/ShaderBuilder/Nodes/Voronoi";

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
  store.graph?.addNode(node)  
}

function createObject<T>(o: new () => T, x: number, y: number) {
  const node = new o() as GraphNodeInterface;
  addNode(node, x, y);
}

const propertyMenu = (): MenuItemLike[] => (
  store.graph?.properties.map((p) => ({
    name: p.name, action: (x: number, y: number) => {
      const node = new PropertyNode(p)
      addNode(node, x, y);
    },
  })) ?? []
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
  { name: 'Phong Shading', action: (x: number, y: number) => createObject(PhongShading, x, y) },
  { name: 'Split', action: (x: number, y: number) => createObject(Split, x, y) },
  { name: 'Combine', action: (x: number, y: number) => createObject(Combine, x, y) },
  { name: 'Twirl', action: (x: number, y: number) => createObject(Twirl, x, y) },
  { name: 'Voronoi', action: (x: number, y: number) => createObject(Voronoi, x, y) },
])
