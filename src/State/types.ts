export interface StoreInterface {
  applyChanges(): Promise<void>;
}

export type CullMode = 'back' | 'none' | 'front';
