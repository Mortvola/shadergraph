import type { DataType } from "../GraphDescriptor";
import InputPort from "../Ports/InputPort";
import type { ValueInterface } from "../Types";
import Value from "../Value";
import ValueNode from "../ValueNode";

class Vector extends ValueNode {
  constructor(value: ValueInterface, id?: number) {
    super(value, id)

    if (Array.isArray(value.value)) {
      const getLabel = (i: number) => (
        i === 3 ? 'W' : String.fromCharCode('X'.charCodeAt(0) + i)
      )

      for (let i = 0; i < value.value.length; i += 1) {
        const port = new InputPort(this, 'float', getLabel(i));
        port.value = new Value('float',  value.value[i]);

        this.inputPorts.push(port)
      }
    }
  }

  getExpression(editMode: boolean): [string, DataType] {
    let expression = '';

    for (const port of this.inputPorts) {
      const [value] = port.getValue(editMode)
      expression += `${value},`
    }

    // TODO: fix this for other vector sizes.
    return [`${this.getDataType()}(${expression})`, this.getDataType()];
  }
}

export default Vector;
