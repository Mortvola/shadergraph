import StageGraph from "./StageGraph";
import StageProperty from "./StageProperty";

class ShaderGraph {
  vertex: StageGraph | null = null;

  fragment: StageGraph | null = null;

  properties: StageProperty[] = [];
}

export default ShaderGraph;
