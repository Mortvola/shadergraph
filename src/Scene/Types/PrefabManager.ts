import Http from "../../Http/src";
import HttpResponse from "../../Http/src/HttpResponse";
import Prefab from "./Prefab";
import type { PrefabDescriptor } from "./Types";

class PrefabManager {
  cache: Map<number, Prefab> = new Map();

  pendingCache: Map<number, Promise<Prefab | undefined>> = new Map();

  async get(id: number): Promise<Prefab | undefined> {
    let prefab = this.cache.get(id);

    if (!prefab) {
      let pendingRequest = this.pendingCache.get(id);

      if (!pendingRequest) {
        pendingRequest = (async () => {
          const response = await Http.get<PrefabDescriptor>(`/api/prefabs/${id}`)

          if (response.ok) {
            const body = await response.body()

            const prefab = Prefab.fromDescriptor(body);

            this.cache.set(id, prefab);

            return prefab;
          }
        })()
        
        this.pendingCache.set(id, pendingRequest)
      }

      prefab = await pendingRequest;

      this.pendingCache.delete(id);
    }

    return prefab;
  }
}

export const prefabManager = new PrefabManager()

export default PrefabManager;
