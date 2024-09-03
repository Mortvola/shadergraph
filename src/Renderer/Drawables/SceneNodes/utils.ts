import type { DrawableComponentInterface } from "../../Types";

export const isDrawableNode = (r: unknown): r is DrawableComponentInterface => (
  r !== undefined
  && (r as DrawableComponentInterface).drawable !== undefined
)
