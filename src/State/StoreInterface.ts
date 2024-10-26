import type { ProjectInterface, ProjectItemLike } from '../Project/Types/types';
import type { ModelerInterface } from './types';

export interface StoreInterface {
  project: ProjectInterface

  // applyMaterial(): Promise<void>;

  previewModeler: ModelerInterface;
}
