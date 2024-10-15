import { makeObservable, observable, runInAction } from 'mobx';

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

  interactive = true;

  constructor(interactive = true) {
    this.interactive = interactive;

    makeObservable(this, {
      translate: observable,
      scale: observable,
    })
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.element = canvas;
    this.ctx = canvas.getContext('2d');

    if (this.interactive) {
      this.start();
    }
    else {
      this.drawFrame()
    }
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

    if (!this.interactive) {
      this.drawFrame();
    }
  }

  screenToViewPoint(x: number, y: number) {
    return [
      ((x - (this.origin.x - this.origin.x * this.scale)) / this.scale - this.translate[0]),
      ((y - (this.origin.y - this.origin.y * this.scale)) / this.scale - this.translate[1]),
    ];
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

  drawFrame(): void {
  }

  updateFrame = () => {
    this.drawFrame();

    if (this.interactive) {
      requestPostAnimationFrame(this.updateFrame)
    }
  }
}

export default Renderer2d;
