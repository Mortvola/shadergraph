import { PSBoolean } from './Property'
import type PropsBase from './PropsBase';
import { isProperty } from './Types';

class PSModule {
  enabled: PSBoolean;

  set onChange(value: (() => void) | undefined) {
    this.setOnChange(value)
  }

  get onChange(): (() => void) | undefined {
    return this.enabled.onChange
  }

  props: PropsBase

  constructor(
    props: PropsBase,
    enabled: boolean | undefined,
    defaultEnabled = false,
    onChange?: () => void,
  ) {
    this.props = props
    this.enabled = new PSBoolean(props, enabled, defaultEnabled, onChange)
  }

  protected setOnChange(onChange?: () => void) {
    if (this.enabled !== undefined) {
      this.enabled.onChange = onChange;
    }
  }

  get hasOverrides(): boolean {
    for (const property in this) {
      if (isProperty(this[property]) && this[property].override) {
        return true;
      }
    }

    return false;
  }
}

export default PSModule;
