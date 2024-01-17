import { PropertyType, StagePropertyInterface, Type } from "./Types";

class StageProperty implements StagePropertyInterface {
  type: Type;

  value: PropertyType;

  constructor(type: Type, value: PropertyType) {
    this.type = type;
    this.value = value;
  }
}

export default StageProperty;
