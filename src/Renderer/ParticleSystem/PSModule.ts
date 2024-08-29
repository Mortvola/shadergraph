import { PSBoolean } from "./Types";

class PSModule {
  _enabled: PSBoolean;

  get enabled(): boolean {
    return this._enabled.value
  }

  set enabled(newValue: boolean) {
    this._enabled.value = newValue;
  }

  _onChange?: () => void;

  get onChange(): (() => void) | undefined {
    return this._onChange
  }

  set onChange(newValue: (() => void) | undefined) {
    this.setOnChange(newValue)
  }

  constructor(onChange?: () => void) {
    this.onChange = onChange;

    this._enabled = new PSBoolean(false, this.onChange)
  }

  protected setOnChange(onChange?: () => void) {
    this._onChange = onChange;

    if (this._enabled !== undefined) {
      this._enabled.onChange = onChange;
    }
  }
}

export default PSModule;
