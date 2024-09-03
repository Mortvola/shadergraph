import { store } from "../../State/store";
import Property from "../../Renderer/ShaderBuilder/Property";
import type { MenuItemLike } from "../../ContextMenu/types";

export type MenuItemRecord<T> = {
  name: string,
  property: () => T,
}

const createVarName = (basename: string) => {
  let id = 0;

  for (;;) {
    const varName = `${basename}${id}`;

    if (!store.graph?.graph.properties.some((p) => p.name === varName)) {
      return varName;
    }

    id += 1;
  }
}

export const menuItems = (): MenuItemLike[] => ([
  { name: 'Texture2D', action: () => store.graph!.addProperty(new Property(createVarName('texture'), 'texture2D', './textures/texture.png')) },
  { name: 'Float', action: () => store.graph!.addProperty(new Property(createVarName('float'), 'float', 0))},
  { name: 'Vector2', action: () => store.graph!.addProperty(new Property(createVarName('property'), 'vec2f', [0, 0]))},
  { name: 'Vector3', action: () => store.graph!.addProperty(new Property(createVarName('property'), 'vec3f', [0, 0, 0]))},
  { name: 'Vector4', action: () => store.graph!.addProperty(new Property(createVarName('property'), 'vec4f', [0, 0, 0, 0]))},
  { name: 'Color', action: () => store.graph!.addProperty(new Property(createVarName('color'), 'color', [0, 0, 0, 0]))},
])
