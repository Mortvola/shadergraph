import { PSBoolean } from "../Properties/Property2"

class PSModule {
  enabled: PSBoolean;

  set onChange(value: (() => void) | undefined) {
    this.setOnChange(value)
  }

  get onChange(): (() => void) | undefined {
    return this.enabled.onChange
  }

  constructor(onChange?: () => void) {
    this.enabled = new PSBoolean(false, onChange)
  }

  copyValues(other: PSModule, noOverrides = true) {
    this.enabled.copyValues(other.enabled, noOverrides)
  }

  hasOverrides() {
    return this.enabled.override
  }

  protected setOnChange(onChange?: () => void) {
    if (this.enabled !== undefined) {
      this.enabled.onChange = onChange;
    }
  }
}

export default PSModule;
