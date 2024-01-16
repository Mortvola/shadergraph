import PropertyNode from "../PropertyNode";

class Sampler extends PropertyNode {
  constructor(id?: number) {
    super('sampler', 'sampler', '', id)

    this.outputPort.varName = 'ourSampler';
  }
}

export default Sampler;
