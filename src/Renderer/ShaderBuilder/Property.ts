import { makeObservable, observable } from 'mobx';
import type { PropertyInterface } from './Types';
import Value from './Value';
import type { DataType, ValueType } from './GraphDescriptor';

class Property implements PropertyInterface {
  name: string;

  value: Value;

  builtin: boolean;

  constructor(name: string, dataType: DataType, value: ValueType, builtin?: boolean) {
    this.name = name;
    this.value = new Value(dataType, value);
    this.builtin = builtin ?? false;

    makeObservable(this, {
      name: observable,
      value: observable,
    })
  }
}

export default Property;
