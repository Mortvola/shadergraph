import { runInAction } from "mobx";
import { MaterialItemInterface } from "../State/types";
import { PropertyInterface } from "./ShaderBuilder/Types";
import { MaterialManagerInterface, MaterialRecordDescriptor } from "./Types";
import { ShaderDescriptor } from "./shaders/ShaderDescriptor";
import { shaderManager } from "./shaders/ShaderManager";
import Value from "./ShaderBuilder/Value";

class MaterialItem implements MaterialItemInterface {
  id = -1;

  name = '';

  shaderId = -1;

  shaderDescriptor?: ShaderDescriptor;

  properties: PropertyInterface[] = [];

  onChange: (() => void) | null = null;

  materialManager: MaterialManagerInterface;

  constructor(materailManager: MaterialManagerInterface, descriptor?: MaterialRecordDescriptor, onChange: (() => void) | null = null) {
    this.materialManager = materailManager;

    if (descriptor) {
      this.id = descriptor.id;
      this.name = descriptor.name;
      this.shaderId = descriptor.shaderId;
      this.properties = descriptor.properties;  
    }

    this.onChange = onChange;
  }

  toDescriptor(): MaterialRecordDescriptor {
    return ({
      id: this.id,
      name: this.name,
      shaderId: this.shaderId,
      properties: this.properties,
    })
  }

  async setShaderId(id: number) {
    if (id !== this.shaderId) {
      const shaderDescr = await shaderManager.getDescriptor(id)

      runInAction(() => {
        this.shaderId = id;

        this.properties = (shaderDescr?.properties ?? []).map((p) => ({
          name: p.name,
          value: new Value(p.dataType, p.value),
          builtin: false,
        }));
  
        this.materialManager.saveItem(this)
      })  
    }
  }
}

export default MaterialItem;
