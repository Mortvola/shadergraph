import { makeObservable, observable, runInAction } from "mobx";
import PSModule from "./PSModule";
import { RendererDescriptor, RenderMode } from "./Types";

class Renderer extends PSModule {
  mode = RenderMode.Billboard;

  constructor(onChange?: () => void) {
    super(onChange);

    makeObservable(this, {
      mode: observable,
    })
  }

  static fromDescriptor(descriptor: RendererDescriptor | undefined, onChange?: () => void) {
    const renderer = new Renderer(onChange);

    if (descriptor) {
      renderer.enabled = descriptor.enabled ?? false;
      renderer.mode = descriptor.mode ?? RenderMode.Billboard;
    }

    return renderer;
  }

  toDescriptor(): RendererDescriptor {
    return ({
      enabled: this.enabled,
      mode: this.mode,
    })
  }

  setRenderMode(mode: RenderMode) {
    runInAction(() => {
      this.mode = mode;

      if (this.onChange) {
        this.onChange()
      }
    })
  }
}

export default Renderer;
