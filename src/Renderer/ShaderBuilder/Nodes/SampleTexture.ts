import { observable, reaction } from "mobx";
import OperationNode from "../OperationNode";
import AlphaPort from "../Ports/AlphaPort";
import BluePort from "../Ports/BluePort";
import GreenPort from "../Ports/GreenPort";
import InputPort from "../Ports/InputPort";
import OutputPort from "../Ports/OutputPort";
import RedPort from "../Ports/RedPort";
import type { DataType, GraphNodeDescriptor } from "../GraphDescriptor";
import RGBPort from "../Ports/RGBPort";

export type SampleTextureSettings = {
  addressModeU: string,
  addressModeV: string,
  minFilter: string,
  magFilter: string,
  mipmapFilter: string,
}

class SampleTexture extends OperationNode {
  samplerName: string | null = null;

  @observable
  accessor settings: SampleTextureSettings = {
    addressModeU: 'clamp-to-edge',
    addressModeV: 'clamp-to-edge',
    minFilter: 'nearest',
    magFilter: 'nearest',
    mipmapFilter: 'nearest',
  };

  constructor(descriptor?: GraphNodeDescriptor) {
    super('SampleTexture', 'SampleTexture', descriptor?.id)

    if (descriptor?.settings) {
      this.settings = {
        ...this.settings,
        ...descriptor.settings,
      }
    }

    this.inputPorts = [
      new InputPort(this, 'texture2D', 'texture'),
      new InputPort(this, 'uv', 'uv'),
    ];

    this.outputPort = [
      new OutputPort(this, 'vec4f', 'rgba'),
      new RGBPort(this, 'vec3f', 'rgb'),
      new RedPort(this, 'float', 'r'),
      new GreenPort(this, 'float', 'g'),
      new BluePort(this, 'float', 'b'),
      new AlphaPort(this, 'float', 'a'),
    ];

    reaction(
      () => ({
        ...this.settings,
      }),
      () => {
        this.notify()
      }
    )
  }

  getDataType(): DataType {
    return 'vec4f'
  }

  createDescriptor(): GraphNodeDescriptor {
    const descriptor = super.createDescriptor()

    descriptor.settings = this.settings;

    return descriptor
  }

  getExpression(editMode: boolean): [string, DataType] {
    const [texture] = this.inputPorts[0].getValue(editMode);
    const sampler = this.samplerName;
    const [textCoord] = this.inputPorts[1].getValue(editMode);
    return [`textureSample(${texture}, ${sampler}, ${textCoord})`, 'vec4f'];
  }
}

export default SampleTexture;
