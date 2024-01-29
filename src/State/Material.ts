import { PropertyInterface } from "../Renderer/ShaderBuilder/Types";
import Entity from "./Entity";
import { MaterialInterface } from "./types";

class Material extends Entity implements MaterialInterface {
  shaderId: number;

  properties: PropertyInterface[];

  constructor(id: number, name: string, shaderId: number, properties: PropertyInterface[]) {
    super(id, name)

    this.shaderId = shaderId;
    this.properties = properties;
  }
}

export default Material;
