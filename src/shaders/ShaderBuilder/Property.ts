import { makeObservable, observable } from "mobx";
import { PropertyInterface, PropertyType, Type } from "./Types";
import Value from "./Value";

class Property implements PropertyInterface {
  name: string;

  value: Value;

  constructor(name: string, dataType: Type, value: PropertyType) {
    this.name = name;
    this.value = new Value(dataType, value);

    makeObservable(this, {
      name: observable,
      value: observable,
    })
  }
}

export default Property;
