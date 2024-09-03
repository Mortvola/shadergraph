import { observable, reaction } from "mobx";
import type { PropsBase } from "./Types";

export class PropertyBase {
  @observable accessor override = false;

  ancestor?: PropertyBase

  props: PropsBase

  onChange?: () => void;

  onRevertOverride?: () => void;

  constructor(props: PropsBase, previousProp?: PropertyBase) {
    this.props = props;
    this.ancestor = previousProp;
  }

  getLineage() {
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
