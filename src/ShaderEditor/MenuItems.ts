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
import { DataType, GraphNodeInterface } from "../Renderer/ShaderBuilder/Types";
import Value from "../Renderer/ShaderBuilder/Value";
import PhongShading from "../Renderer/ShaderBuilder/Nodes/PhongShading";
import Combine from "../Renderer/ShaderBuilder/Nodes/Combine";
import Split from "../Renderer/ShaderBuilder/Nodes/Split";
import Twirl from "../Renderer/ShaderBuilder/Nodes/Twirl";
import Voronoi from "../Renderer/ShaderBuilder/Nodes/Voronoi";
import Power from "../Renderer/ShaderBuilder/Nodes/Power";
import { MenuItemLike } from "../ContextMenu/types";
import Lerp from "../Renderer/ShaderBuilder/Nodes/Lerp";
import Subtract from "../Renderer/ShaderBuilder/Nodes/Subtract";
import VertexColor from "../Renderer/ShaderBuilder/Nodes/VertexColor";
import Step from "../Renderer/ShaderBuilder/Nodes/Step";
import Clamp from "../Renderer/ShaderBuilder/Nodes/Clamp";
import Float from "../Renderer/ShaderBuilder/Nodes/Float";
import Min from "../Renderer/ShaderBuilder/Nodes/Min";
import Max from "../Renderer/ShaderBuilder/Nodes/Max";
import FWidth from "../Renderer/ShaderBuilder/Nodes/FWidth";
import Divide from "../Renderer/ShaderBuilder/Nodes/Divide";
import TextureSize from "../Renderer/ShaderBuilder/Nodes/TextureSize";
import Inverse from "../Renderer/ShaderBuilder/Nodes/Inverse";
import Distance from "../Renderer/ShaderBuilder/Nodes/Distance";

function addNode(node: GraphNodeInterface, x: number, y: number) {
  node.position = { x, y };
  store.graph?.addNode(node)  
}

function createObject<T extends GraphNodeInterface>(o: new () => T, x: number, y: number) {
  const node = new o();
  addNode(node, x, y);
}

const propertyMenu = (): MenuItemLike[] => (
  store.graph?.graph.properties.map((p) => ({
    name: p.name, action: (x: number, y: number) => {
      const node = new PropertyNode(p)
      addNode(node, x, y);
    },
  })) ?? []
)

const values = (): MenuItemLike[] => (
  [1, 2, 3, 4].map((v) => ({
    name: v === 1 ? 'float' : `vector${v}`,
    action: (x: number, y: number) => {
      let node: GraphNodeInterface | undefined = undefined

      if (v === 1) {
        node = new Float();
      }
      else {
        const types: DataType[] = ['vec2f', 'vec3f', 'vec4f']
        node = new Vector(new Value(types[v - 2], new Array(v).fill(0)));
      }

      addNode(node, x, y);
    },
  }))
)

const math = (): MenuItemLike[] => ([
  { name: 'Add', action: (x: number, y: number) => createObject(Add, x, y) },
  { name: 'Subtract', action: (x: number, y: number) => createObject(Subtract, x, y) },
  { name: 'Multiply', action: (x: number, y: number) => createObject(Multiply, x, y) },
  { name: 'Divide', action: (x: number, y: number) => createObject(Divide, x, y) },
  { name: 'Power', action: (x: number, y: number) => createObject(Power, x, y) },
  { name: 'Inverse', action: (x: number, y: number) => createObject(Inverse, x, y) },  
  { name: 'Lerp', action: (x: number, y: number) => createObject(Lerp, x, y) },
  { name: 'Max', action: (x: number, y: number) => createObject(Max, x, y) },
  { name: 'Min', action: (x: number, y: number) => createObject(Min, x, y) },
])

export const menuItems = (): MenuItemLike[] => ([
  { name: 'Properties', submenu: propertyMenu },
  { name: 'Values', submenu: values },
  { name: 'Math', submenu: math },
  { name: 'Clamp', action: (x: number, y: number) => createObject(Clamp, x, y) },
  { name: 'Combine', action: (x: number, y: number) => createObject(Combine, x, y) },
  { name: 'Display', action: (x: number, y: number) => createObject(Display, x, y) },
  { name: 'Distance', action: (x: number, y: number) => createObject(Distance, x, y) },
  { name: 'Fraction', action: (x: number, y: number) => createObject(Fraction, x, y) },
  { name: 'FWidth', action: (x: number, y: number) => createObject(FWidth, x, y) },  
  { name: 'Phong Shading', action: (x: number, y: number) => createObject(PhongShading, x, y) },
  { name: 'SampleTexture', action: (x: number, y: number) => createObject(SampleTexture, x, y) },
  { name: 'Split', action: (x: number, y: number) => createObject(Split, x, y) },
  { name: 'Step', action: (x: number, y: number) => createObject(Step, x, y) },
  { name: 'TileAndScroll', action: (x: number, y: number) => createObject(TileAndScroll, x, y) },
  { name: 'Time', action: (x: number, y: number) => createObject(Time, x, y) },
  { name: 'TextureSize', action: (x: number, y: number) => createObject(TextureSize, x, y) },
  { name: 'Twirl', action: (x: number, y: number) => createObject(Twirl, x, y) },
  { name: 'UV', action: (x: number, y: number) => createObject(UV, x, y) },
  { name: 'Vertex Color', action: (x: number, y: number) => createObject(VertexColor, x, y) },
  { name: 'Voronoi', action: (x: number, y: number) => createObject(Voronoi, x, y) },
])
