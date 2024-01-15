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

      const node1 = store.graph.nodes[0];
      const node2 = store.graph.nodes[1];

      this.ctx.beginPath();
      // this.ctx.moveTo(node1.x * this.scale[0], node1.y * this.scale[1]);
      // this.ctx.lineTo(node2.x * this.scale[0], node2.y * this.scale[1]);
      this.ctx.moveTo(node1.x, node1.y);
      this.ctx.lineTo(node2.x, node2.y);
      this.ctx.strokeStyle = "white";
      this.ctx.stroke();
    }

    requestPostAnimationFrame(this.updateFrame)
  }
}

export default Renderer2d;
