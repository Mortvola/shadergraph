import Http from "../../Http/src";
import type ObjectBase from "./ObjectBase";

class SceneManager {
  async add(object: ObjectBase) {
    const descriptor = object.toDescriptor();

    const response = await Http.post<Omit<unknown, 'id'>, { id: number }>(`/api/scene`, descriptor);

    if (response.ok) {
      const body = await response.body();

      object.id = body.id;
    }  
  }

  async update(object: ObjectBase) {
    const response = await Http.patch<unknown, void>(`/api/scene/${object.id}`, object.toDescriptor());

    if (response.ok) { /* empty */ }  

  }
}

export const sceneManager = new SceneManager();

export default SceneManager;
