import { type IReactionDisposer, observable, reaction } from 'mobx';
import type { PropertyBaseInterface } from './Types';

class PropertyBase implements PropertyBaseInterface {
  @observable
  accessor override = false;

  onChange?: () => void;

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
