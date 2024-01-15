import SampleTexture from "../shaders/ShaderBuilder/Nodes/SampleTexture";
import TileAndScroll from "../shaders/ShaderBuilder/Nodes/TileAndScroll";
import { GraphNodeInterface } from "../shaders/ShaderBuilder/Types";

export type MenuItemRecord<T> = {
  node: new () => T;
  name: string;
}

export const menuItems: MenuItemRecord<GraphNodeInterface>[] = [
  { node: SampleTexture, name: 'SampleTexture' },
  { node: TileAndScroll, name: 'TileAndScroll' },
]
