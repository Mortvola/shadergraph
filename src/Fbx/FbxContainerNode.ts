import FbxNode from "./FbxNode";
import { FbxContainerNodeInterface, FbxNodeInterface } from "./types";

class FbxContainerNode extends FbxNode implements FbxContainerNodeInterface {
  nodes: FbxNodeInterface[] = [];

  addNode(node: FbxNodeInterface) {
    this.nodes.push(node);
  }
}

export default FbxContainerNode;
