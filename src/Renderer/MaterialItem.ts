import { MaterialItemInterface } from "../State/types";
import { PropertyInterface } from "./ShaderBuilder/Types";
import { MaterialRecordDescriptor } from "./types";

class MaterialItem implements MaterialItemInterface {
  id = -1;

  name = '';

  shaderId = -1;

  properties: PropertyInterface[] = [];

  onChange: (() => void) | null = null;

  constructor(descriptor?: MaterialRecordDescriptor, onChange: (() => void) | null = null) {
    if (descriptor) {
      this.id = descriptor.id;
      this.name = descriptor.name;
      this.shaderId = descriptor.shaderId;
      this.properties = descriptor.properties;  
    }

    this.onChange = onChange;
  }
}

export default MaterialItem;
