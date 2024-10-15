import type { SceneObjectInterface } from "../../Scene/Types/Types";
import type { PropsBaseInterface } from './Types';
import { isModule, isProperty } from "./Types";


class PropsBase implements PropsBaseInterface {
  nodeObject?: SceneObjectInterface;

  toDescriptor(): object | undefined {
    return undefined;
  }

  get hasOverrides(): boolean {
    for (const property in this) {
      if (isProperty(this[property]) && this[property].override) {
        return true;
      }

      if (isModule(this[property]) && this[property].hasOverrides) {
        return true;
      }
    }

    return false;
  }
}

export default PropsBase;

