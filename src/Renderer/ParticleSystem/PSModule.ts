import { PSBoolean } from "../Properties/Property2"

class PSModule {
  enabled: PSBoolean;

  set onChange(value: (() => void) | undefined) {
    this.setOnChange(value)
  }

  get onChange(): (() => void) | undefined {
    return this.enabled.onChange
  }

  constructor(enabled: boolean | undefined, defaultEnabled = false, onChange?: () => void, previousProp?: PSBoolean) {
    this.enabled = new PSBoolean(enabled, defaultEnabled, onChange, previousProp)
  }

  protected setOnChange(onChange?: () => void) {
    if (this.enabled !== undefined) {
      this.enabled.onChange = onChange;
    }
  }
}

export default PSModule;
