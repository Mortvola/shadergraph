import { makeObservable, observable } from "mobx";
import GraphNode from "./GraphNode";
import OutputPort from "./OutputPort";
import { PropertyNodeInterface, PropertyType, Type } from "./Types";

class PropertyNode extends GraphNode implements PropertyNodeInterface {
  dataType: Type;

  value: PropertyType;

  outputPort: OutputPort;

  readonly = false;

  constructor(name: string, dataType: Type, value: PropertyType, id?: number) {
    super('property', name, id)

    this.name = name;
    this.dataType = dataType;
    this.value = value;

    this.outputPort = new OutputPort(this, dataType, name);
    this.outputPort.varName = this.getValueString();

    makeObservable(this, {
      value: observable,
    })
  }

  getValueString(): string {
    switch (typeof this.value) {
      case 'string':
        return this.value;

      case 'number':
        return this.value.toString();

      case 'object': {
        if (this.value.length === 2) {
          return `vec2f(${this.value[0]}, ${this.value[1]})`;
        }

        if (Array.isArray(this.value) && this.value.length === 3) {
          return `vec3f(${this.value[0]}, ${this.value[1]}, ${this.value[2]})`;
        }

        return `vec4f(${this.value[0]}, ${this.value[1]}, ${this.value[2]}, ${this.value[3]})`;
      }
    }
  }
}

export default PropertyNode;
