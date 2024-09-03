import { ProjectInterface } from "../Project/Types/types";
import { ModelerInterface } from "./types";

export interface StoreInterface {
  project: ProjectInterface

  // applyMaterial(): Promise<void>;

  previewModeler: ModelerInterface;
}
