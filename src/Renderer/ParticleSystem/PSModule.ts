import { PSBoolean } from "../Properties/Types";

class PSModule {
  _enabled: PSBoolean;

  get enabled(): boolean {
    return this._enabled.value
  }

  set enabled(value: boolean) {
    this._enabled.value = { value };
  }

  set onChange(value: (() => void) | undefined) {
    this.setOnChange(value)
  }

  constructor(onChange?: () => void) {
    this._enabled = new PSBoolean(false, onChange)
  }

  copyValues(other: PSModule, noOverrides = true) {
    this._enabled.copyValues(other._enabled, noOverrides)
  }

  hasOverrides() {
    return this._enabled.override
  }

  protected setOnChange(onChange?: () => void) {
    if (this._enabled !== undefined) {
      this._enabled.onChange = onChange;
    }
  }
}

export default PSModule;
