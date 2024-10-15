import type { DrawableComponentInterface } from '../../Types';

export const isDrawableComponent = (r: unknown): r is DrawableComponentInterface => (
  (r as DrawableComponentInterface)?.drawable !== undefined
)
