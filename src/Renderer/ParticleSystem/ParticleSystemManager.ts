import Http from "../../Http/src";
import ParticleSystem from "./ParticleSystem";
import { ParticleRecord } from "../Types";
import ParticleSystemProps from "./ParticleSystemProps";

class ParticleSystemManager { 
  map: Map<number, ParticleSystem> = new Map()

  loading: Promise<ParticleSystem | undefined> | null = null

  async getParticleSystem(id: number) {
    let ps = this.map.get(id);

    if (!ps) {
      if (!this.loading) {
        this.loading = this.load(id);

        ps = await this.loading

        if (ps) {
          this.map.set(id, ps)
        }  
      }
      else {
        ps = await this.loading
      }

      this.loading = null;
    }

    return ps;
  }

  private async load(id: number) {
    const response = await Http.get<ParticleRecord>(`/api/particless/${id}`)

    if (response.ok) {
      const rec = await response.body();

      const props = new ParticleSystemProps(rec.descriptor);
      const particleSystem = new ParticleSystem(props);

      return particleSystem;
    }  
  }

  add(particleSystem: ParticleSystem) {
    // this.map.set(particleSystem.id, particleSystem)
  }
}

export const particleSystemManager = new ParticleSystemManager()

export default ParticleSystemManager;
