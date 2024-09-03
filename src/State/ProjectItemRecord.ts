import type { ProjectItemType } from "../Project/Types/types";

export type ProjectItemRecord = {
  id: number,
  parentId: number,
  name: string,
  type: ProjectItemType,
  itemId: number | null,
}
