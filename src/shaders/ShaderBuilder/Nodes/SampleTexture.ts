import InputPort from "../InputPort";
import OperationNode from "../OperationNode";
import OutputPort from "../OutputPort";

class SampleTexture extends OperationNode {
  constructor(id: number) {
    super('SampleTexture', id)

    this.inputPorts = [
      new InputPort(this, 'texture2D', 'texture'),
      new InputPort(this, 'sampler', 'sampler'),
      new InputPort(this, 'vec2f', 'uv'),
    ];

    this.outputPort = new OutputPort(this, 'vec4f', 'sample')
  }

  output(): string {
    const outputVar = this.outputPort?.varName;
    const texture = 'ourTexture';
    const sampler = 'ourSampler';
    const textCoord = this.inputPorts[2].getVarname();
    // console.log(`var ${outputVar} = textureSample(ourTexture, ourSampler, fract(vertexOut.texcoord * texAttr.scale + offset));`);
    return `var ${outputVar} = textureSample(${texture}, ${sampler}, ${textCoord});\n`;
  }
}

export default SampleTexture;
