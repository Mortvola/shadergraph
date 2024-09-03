import { observable, reaction } from "mobx";
import type { LineageEntry, PropertyBaseInterface, PropsBase } from "./Types";
import { PrefabInstanceObjectInterface } from "../../Scene/Types/Types";
import { PrefabNodeInterface } from "../../Scene/Types/Types";

export class PropertyBase implements PropertyBaseInterface {
  @observable accessor override = false;

  ancestor?: PropertyBase

  props: PropsBase

  onChange?: () => void;

  onRevertOverride?: () => void;

  constructor(props: PropsBase, previousProp?: PropertyBase) {
    this.props = props;
    this.ancestor = previousProp;
  }

  getLineage(): LineageEntry[] {
    const lineage: LineageEntry[] = [];
    let node: PrefabNodeInterface | undefined = (this.props.node as PrefabInstanceObjectInterface)?.ancestor;

    while (node) {
      lineage.push({ id: node.id, name: node.name, container: node.prefab.name})

      node = node.ancestor
    }

    return lineage
  }

  revertOverride() {
    if (this.onRevertOverride) {
      this.onRevertOverride()
    }
  }

  reactOnChange(f: () => unknown) {
    reaction(f, () => {
      if (this.onChange) {
        this.onChange()
      }
    })
  }
}

export default PropertyBase;
