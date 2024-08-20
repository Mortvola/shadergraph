import { makeObservable, observable, runInAction } from "mobx";

class PSModule {
  enabled = false;

  onChange?: () => void;

  constructor(onChange?: () => void) {
    this.onChange = onChange;

    makeObservable(this, {
      enabled: observable,
    })
  }

  setEnabled(enabled: boolean) {
    runInAction(() => {
      this.enabled = enabled

      if (this.onChange) {
        this.onChange();
      }
    })
  }
}

export default PSModule;
