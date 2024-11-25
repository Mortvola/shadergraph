import { type IReactionDisposer, observable, reaction } from 'mobx';
import type { PropertyBaseInterface } from './Types';

class PropertyBase implements PropertyBaseInterface {
  @observable
  accessor override = false;

  onChange?: () => void;

  revertOverride() {
    // if (this.base) {
    //   this.copyProp(this.base)
    // }

    // if (this.onRevertOverride) {
    //   this.onRevertOverride()
    // }
  }

  // applyOverride(original: PropertyBase): void {
    // runInAction(() => {
    //   original.copyProp(this)

    //   // Mark the change as an override unless the original is the
    //   // root property (.original === undefined)
    //   original.override = original.base !== undefined

    //   this.revertOverride()
    // })

    // // Propogate the new property value to the variants.
    // runInAction(() => {
    //   original.propogate()
    // })
  // }

  // Members and methods for managing the mobx reaction to report changes...
  observables?: () => unknown;

  reactionDisposer?: IReactionDisposer;

  enableReaction() {
    if (this.observables) {
      this.reactionDisposer = reaction(this.observables, () => {
        if (this.onChange) {
          this.onChange()
        }
      })
    }
  }

  disableReaction() {
    if (this.reactionDisposer) {
      this.reactionDisposer()
    }
  }

  reactOnChange(observables: () => unknown) {
    this.observables = observables;

    this.enableReaction();
  }
}

export default PropertyBase;
