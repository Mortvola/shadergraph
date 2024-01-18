import Property from "./Property";
import { StagePropertyInterface } from "./Types";

class StageProperty implements StagePropertyInterface {
  property: Property;

  constructor(property: Property) {
    this.property = property
  }
}

export default StageProperty;
