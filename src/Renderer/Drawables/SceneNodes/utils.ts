import { DrawableComponentInterface } from "../../types";

export const isDrawableNode = (r: unknown): r is DrawableComponentInterface => (
  r !== undefined
  && (r as DrawableComponentInterface).drawable !== undefined
)
