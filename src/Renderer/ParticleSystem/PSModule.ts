import { PSBoolean } from "./Types";

class PSModule {
  _enabled: PSBoolean;

  get enabled(): boolean {
    return this._enabled.value
  }

  set enabled(newValue: boolean) {
    this._enabled.value = newValue;
  }

  set onChange(newValue: (() => void) | undefined) {
    this.setOnChange(newValue)
  }

  constructor(onChange?: () => void) {
    this._enabled = new PSBoolean(false, onChange)
  }

  protected setOnChange(onChange?: () => void) {
    if (this._enabled !== undefined) {
      this._enabled.onChange = onChange;
    }
  }
}

export default PSModule;
