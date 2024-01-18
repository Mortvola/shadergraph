import { PropertyType, Type, ValueInterface } from "./Types";

class Value implements ValueInterface {
  dataType: Type;

  value: PropertyType;

  constructor(dataType: Type, value: PropertyType) {
    this.dataType = dataType;
    this.value = value;
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

export default Value;
