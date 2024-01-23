import { store } from "../State/store";
import Property from "../Renderer/ShaderBuilder/Property";

export type MenuItemRecord<T> = {
  name: string,
  property: () => T,
}

const createVarName = (basename: string) => {
  let id = 0;

  for (;;) {
    const varName = `${basename}${id}`;

    if (!store.graph?.properties.some((p) => p.name === varName)) {
      return varName;
    }

    id += 1;
  }
}

export const menuItems: MenuItemRecord<Property>[] = [
  { name: 'Texture2D', property: () => new Property(createVarName('texture'), 'texture2D', './textures/texture.png') },
  { name: 'Vector2', property: () => new Property(createVarName('property'), 'vec2f', [0, 0])},
  { name: 'Vector3', property: () => new Property(createVarName('property'), 'vec3f', [0, 0, 0])},
  { name: 'Vector4', property: () => new Property(createVarName('property'), 'vec4f', [0, 0, 0, 0])},
  { name: 'Float', property: () => new Property(createVarName('float'), 'float', 0)},
]
