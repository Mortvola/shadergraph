import { runInAction } from "mobx";
import type { MaterialItemInterface } from "../../State/types";
import type { PropertyInterface } from "../ShaderBuilder/Types";
import type { MaterialManagerInterface, MaterialRecordDescriptor } from "../Types";
import type { ShaderDescriptor } from "../shaders/ShaderDescriptor";
import { shaderManager } from "../shaders/ShaderManager";
import Value from "../ShaderBuilder/Value";
import Entity from "../../State/Entity";

class MaterialItem extends Entity implements MaterialItemInterface {
  shaderId = -1;

  shaderDescriptor?: ShaderDescriptor;

  properties: PropertyInterface[] = [];

  onChange: (() => void) | null = null;

  materialManager: MaterialManagerInterface;

  constructor(materailManager: MaterialManagerInterface, descriptor?: MaterialRecordDescriptor, onChange: (() => void) | null = null) {
    super(-1, '')

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
      const shaderRecord = await shaderManager.getShader(id)

      runInAction(() => {
        this.shaderId = id;

        this.properties = (shaderRecord?.descriptor.properties ?? []).map((p) => ({
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
