import Display from "../shaders/ShaderBuilder/Nodes/Display";
import Multiply from "../shaders/ShaderBuilder/Nodes/Multiply";
import SampleTexture from "../shaders/ShaderBuilder/Nodes/SampleTexture";
import Sampler from "../shaders/ShaderBuilder/Nodes/Sampler";
import Texture2D from "../shaders/ShaderBuilder/Nodes/Texture2D";
import TileAndScroll from "../shaders/ShaderBuilder/Nodes/TileAndScroll";
import Time from "../shaders/ShaderBuilder/Nodes/Time";
import UV from "../shaders/ShaderBuilder/Nodes/UV";
import Vector2D from "../shaders/ShaderBuilder/Nodes/Vector2D";
import { GraphNodeInterface } from "../shaders/ShaderBuilder/Types";

export type MenuItemRecord<T> = {
  node: new () => T;
  name: string;
}

export const menuItems: MenuItemRecord<GraphNodeInterface>[] = [
  { node: SampleTexture, name: 'SampleTexture' },
  { node: TileAndScroll, name: 'TileAndScroll' },
  { node: Display, name: 'Display' },
  { node: Multiply, name: 'Multiply' },
  { node: Time, name: 'Time' },
  { node: UV, name: 'UV' },
  { node: Texture2D, name: 'Texture2D' },
  { node: Sampler, name: 'Sampler'},
  { node: Vector2D, name: 'Vector2D' },
]
