import { type IReactionDisposer, observable, reaction, runInAction } from "mobx";
import type { LineageEntry, PropertyBaseInterface, PropsBase } from "./Types";

export class PropertyBase implements PropertyBaseInterface {
  @observable
  accessor override = false;

  readonly name: string;

  base?: PropertyBase

  variations: Set<PropertyBase> = new Set()

  props: PropsBase

  onChange?: () => void;

  onRevertOverride?: () => void;

  constructor(name: string, props: PropsBase, originalProp?: PropertyBase) {
    this.name = name;
    this.props = props;
    this.base = originalProp;
    
    if (originalProp) {
      originalProp.variations.add(this);
    }
  }

  toString(): string {
    throw new Error('not implemented')
  }

  getLineage(): LineageEntry[] {
    const lineage: LineageEntry[] = [];
    let property: PropertyBase | undefined = this.base;

    while (property) {
      const node = property.props.node;
      lineage.push({ property, name: node?.name ?? 'unknown node', container: 'unknown prefab'})

      property = property.base
    }

    return lineage
  }

  revertOverride() {
    if (this.base) {
      this.copyProp(this.base)
    }

    if (this.onRevertOverride) {
      this.onRevertOverride()
    }
  }

  applyOverride(original: PropertyBase): void {
    runInAction(() => {
      original.copyProp(this)
  
      // Mark the change as an override unless the original is the
      // root property (.original === undefined)
      original.override = original.base !== undefined
  
      this.revertOverride()       
    })

    // Propogate the new property value to the variants.
    runInAction(() => {
      original.propogate()      
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  copyProp(_other: PropertyBase) {
    throw new Error('not implemented')
  }

  // Propogates the property to the variants unless
  // there is an override.
  propogate() {
    this.disableReaction()

    for (const variation of this.variations) {
      if (!variation.override) {
        variation.copyProp(this)

        variation.propogate()
      }
    }

    this.enableReaction()
  }

  // Members and methods for managing the mobx reaction to report changes...
  dataFunction?: () => unknown;

  reactionDisposer?: IReactionDisposer;

  enableReaction() {
    if (this.dataFunction) {
      this.reactionDisposer = reaction(this.dataFunction, () => {
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

  reactOnChange(dataFunction: () => unknown) {
    this.dataFunction = dataFunction;

    this.enableReaction();
  }
}

export default PropertyBase;
