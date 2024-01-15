import { makeAutoObservable, runInAction } from "mobx";

class GraphNode {
  x = 0;

  y = 0;

  constructor() {
    makeAutoObservable(this);
  }

  setPosition(x: number, y: number) {
    runInAction(() => {
      this.x = x;
      this.y = y;
    })
  }
}

export default GraphNode;
