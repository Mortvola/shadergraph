import { observable, reaction } from "mobx";
import type { DataType, GraphNodeDescriptor } from "../GraphDescriptor";
import OperationNode from "../OperationNode";
import InputPort from "../Ports/InputPort";
import type GraphNotification from "../GraphNotification";

export enum BlendMode {
  Alpha = 'Alpha',
  Addititve = 'Additive',
}

export type DisplaySettings = {
  blendMode: BlendMode,
}

export const isDisplaySettings = (r: unknown): r is DisplaySettings => (
  (r as DisplaySettings)?.blendMode !== undefined
)

class Display extends OperationNode {
  @observable
  accessor settings: DisplaySettings = {
    blendMode: BlendMode.Alpha,
  };

  onChange?: () => void;

  constructor(nodeDescriptor?: GraphNodeDescriptor) {
    super('Display', 'Display', nodeDescriptor?.id)

    if (nodeDescriptor?.settings) {
      this.settings = {
        ...this.settings,
        ...nodeDescriptor.settings,
      }
    }

    this.inputPorts = [
      new InputPort(this, 'vec4f', 'rgb'),
      new InputPort(this, 'float', 'a'),
    ]

    reaction(
      () => ({
        ...this.settings,
      }),
      () => {
        this.notify()
      }
    )
  }

  createDescriptor(): GraphNodeDescriptor {
    const descriptor = super.createDescriptor()

    descriptor.settings = this.settings;
  
    return descriptor
  }

  getExpression(editMode: boolean): [string, DataType] {
    const [alpha] = this.inputPorts[1].getValue(editMode)

    if (this.inputPorts[1].edge) {
      const [varA] = this.inputPorts[0].getValue(editMode)

      return [`vec4f((${varA}).rgb, ${alpha})`, 'vec4f'];
    }

    const [varA, dataType] = this.inputPorts[0].getValue(editMode);

    if (dataType === 'float') {
      return [`vec4f(${varA}, 0, 0, ${alpha})`, 'vec4f'];
    }

    if (dataType === 'vec2f') {
      return [`vec4f(${varA}, 0, ${alpha})`, 'vec4f'];
    }

    if (dataType === 'vec3f') {
      return [`vec4f(${varA}, ${alpha})`, 'vec4f'];
    }

    return [`${varA}`, 'vec4f'];
  }

  output(editMode: boolean): string {
    const [value] = this.getExpression(editMode)

    return `var fragOut = ${value};`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  notify(notification?: GraphNotification) {
    if (this.onChange) {
      this.onChange()
    }
  }
}

export default Display;
