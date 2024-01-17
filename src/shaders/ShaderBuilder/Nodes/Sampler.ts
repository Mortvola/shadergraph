import PropertyNode from "../PropertyNode";

class Sampler extends PropertyNode {
  constructor(id?: number) {
    super('sampler', 'sampler', '', id)

    this.outputVarName = 'ourSampler';
  }
}

export default Sampler;
