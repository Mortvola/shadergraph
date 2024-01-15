import { store } from "./State/store";

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

  scale: [number, number] = [1, 1];

  started = false;

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

  setScale(x: number, y: number) {
    this.scale = [x, y];
    this.ctx?.scale(x, y);
  }

  updateFrame = () => {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.element?.width ?? 0, this.element?.height ?? 0);

      for (const edge of store.graph.edges) {
        const startX = edge.output.node.x + edge.output.offsetX;
        const startY = edge.output.node.y + edge.output.offsetY;

        const endX = edge.input.node.x + edge.input.offsetX;
        const endY = edge.input.node.y + edge.input.offsetY;

        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(startX + 10, startY);
        this.ctx.lineTo(endX - 10, endY);
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = "white";
        this.ctx.stroke();
      }

      if (store.graph.dragConnector !== null) {
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
