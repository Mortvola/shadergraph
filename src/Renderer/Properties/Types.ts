import { observable, reaction } from "mobx";

export type PropertyType<T> = { value: T, override?: boolean }

export class Property {
  @observable accessor override = false;

  onChange?: () => void;

  constructor(onChange?: () => void) {
    this.onChange = onChange
  }

  reactOnChange(f: () => any) {
    reaction(f, () => {
      if (this.onChange) {
        this.onChange()
      }
    })
  }
}

export const removeUndefinedKeys = <T extends Record<string, unknown>>(obj: T): T | undefined => {
  Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
  return Object.keys(obj).length > 0 ? obj : undefined;
};
