import { vec2 } from "wgpu-matrix";
import { store } from "./State/store";
import { makeObservable, observable, runInAction } from "mobx";

const requestPostAnimationFrame = (task: (timestamp: number) => void) => {
  requestAnimationFrame((timestamp: number) => {
    setTimeout(() => {
      task(timestamp);
    }, 0);
  });
};

class Renderer2d {
  element: HTMLCanvasElement | null = null;

  ctx: CanvasRenderingContext2D | null = null;

  canvasScale: [number, number] = [1, 1];

  scale = 1;

  translate: [number, number] = [0, 0];

  origin: { x: number, y: number } = { x: 0, y: 0}

  started = false;

  constructor() {
    makeObservable(this, {
      translate: observable,
      scale: observable,
    })
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.element = canvas;
    this.ctx = canvas.getContext("2d");

    this.start();
  }

  start(): void {
    if (!this.started) {
      this.started = true;
      requestPostAnimationFrame(this.updateFrame);
    }
  }

  setCanvasScale(x: number, y: number) {
    this.canvasScale = [x, y];
    this.ctx?.scale(this.canvasScale[0], this.canvasScale[1]);
  }

  changeScale(delta: number) {
    runInAction(() => {
      this.scale += delta;

      if (this.scale > 1) {
        this.scale = 1
      }
      else if (this.scale < 0.5) {
        this.scale = 0.5
      }
    })
  }

  setTranslation(x: number, y: number) {
    runInAction(() => {
      this.translate = [x, y]
    })
  }

  setOrigin(origin: { x: number, y: number }) {
    runInAction(() => {
      this.origin = origin
    })
  }

  updateFrame = () => {
    if (this.ctx && store.graph) {
      this.ctx.clearRect(0, 0, this.element?.width ?? 0, this.element?.height ?? 0);

      for (const edge of store.graph.graph.fragment.edges) {
        const startX = (edge.output.node.position!.x + this.translate[0]) * this.scale + (this.origin.x - this.origin.x * this.scale) + edge.output.offsetX;
        const startY = (edge.output.node.position!.y + this.translate[1]) * this.scale + (this.origin.y - this.origin.y * this.scale) + edge.output.offsetY;

        const endX = (edge.input.node.position!.x + this.translate[0]) * this.scale + (this.origin.x - this.origin.x * this.scale) + edge.input.offsetX;
        const endY = (edge.input.node.position!.y + this.translate[1]) * this.scale + (this.origin.y - this.origin.y * this.scale) + edge.input.offsetY;

        const curveRadius = 20;

        const start = vec2.create(startX, startY);
        const end = vec2.create(endX, endY);
        const turn1 = vec2.add(start, vec2.create(curveRadius, 0));
        const turn2 = vec2.add(end, vec2.create(-curveRadius, 0));

        const distance = vec2.distance(turn1, turn2);
        
        const vector = vec2.normalize(vec2.subtract(turn2, turn1));

        const p1 = vec2.addScaled(turn1, vector, distance / 2);
        const p2 = vec2.addScaled(turn2, vector, -distance / 2);

        this.ctx.beginPath();

        this.ctx.moveTo(start[0], start[1]);
        this.ctx.bezierCurveTo(turn1[0], turn1[1], turn1[0], turn1[1], p1[0], p1[1])

        this.ctx.lineTo(p2[0], p2[1]);
        this.ctx.bezierCurveTo(turn2[0], turn2[1], turn2[0], turn2[1], end[0], end[1])

        this.ctx.strokeStyle = "white";
        this.ctx.stroke();
      }

      if (store.graph && store.graph.dragConnector !== null) {
        const point1 = store.graph.dragConnector[0];
        const point2 = store.graph.dragConnector[1];

        this.ctx.beginPath();
        this.ctx.moveTo(point1[0], point1[1]);
        this.ctx.lineTo(point1[0] + 10, point1[1])
        this.ctx.lineTo(point2[0], point2[1]);
        this.ctx.strokeStyle = "white";
        this.ctx.stroke();
      }
    }

    requestPostAnimationFrame(this.updateFrame)
  }
}

export default Renderer2d;
