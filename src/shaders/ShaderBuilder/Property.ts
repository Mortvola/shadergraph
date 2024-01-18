import { makeObservable, observable } from "mobx";
import { PropertyInterface, PropertyType, Type } from "./Types";

class Property implements PropertyInterface {
  name: string;

  dataType: Type;

  value: PropertyType;

  constructor(name: string, dataType: Type, value: PropertyType) {
    this.name = name;
    this.dataType = dataType;
    this.value = value;

    makeObservable(this, {
      name: observable,
      value: observable,
    })
  }
}

export default Property;
