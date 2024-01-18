import BuiltIn from "../BuiltInNode";
import OutputPort from "../Ports/OutputPort";

class Sampler extends BuiltIn {
  constructor(id?: number) {
    super('sampler', 'sampler', id)

    this.outputPort = [new OutputPort(this, 'sampler', 'sampler')];
    this.setVarName('ourSampler');
  }
}

export default Sampler;
