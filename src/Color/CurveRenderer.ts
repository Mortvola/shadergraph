import { vec2 } from "wgpu-matrix";
import type { PSCurvePoint } from "../Renderer/ParticleSystem/Types";
import Renderer2d from "../Renderer2d";

export enum Subpoint {
  LeftCtrl,
  Main,
  RightCtrl,
}

class CurveRenderer extends Renderer2d {
  points: PSCurvePoint[] = [];

  radius = 12;

  constructor() {
    super(false)
  }

  renderPoint(x: number, y:  number, strokeStyle: string, fillStyle: string) {
    if (this.ctx) {
      this.ctx.fillStyle = fillStyle;
      this.ctx.strokeStyle = strokeStyle;

      this.ctx.beginPath()
      this.ctx.ellipse(x, y, this.radius / this.canvasScale[0], this.radius / this.canvasScale[1], 0, 0, 2 * Math.PI);
      this.ctx.fill()
      this.ctx.strokeStyle = "black";
      this.ctx.stroke()  
    }
  }

  updateCurve(points: PSCurvePoint[]) {
    this.points = points;

    this.drawFrame()
  }

  drawFrame() {
    if (this.ctx && this.points.length > 0) {
      const points = this.points;
      const width = this.element?.width ?? 0;
      const height = this.element?.height ?? 0;

      this.ctx.clearRect(0, 0, width, height);

      // Draw the curves
      for (let i = 0; i < points.length - 1; i += 1) {
        const x = points[i].x * width / this.canvasScale[0];
        const y = (height - points[i].y * height) / this.canvasScale[1];

        // Draw the curve

        this.ctx.strokeStyle = "black";

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.bezierCurveTo(
          ((points[i].x + points[i].rightCtrl.x) * width) / this.canvasScale[0],
          (height - (points[i].y + points[i].rightCtrl.y) * height) / this.canvasScale[1],
          ((points[i + 1].x + points[i + 1].leftCtrl.x) * width) / this.canvasScale[0],
          (height - (points[i + 1].y + points[i + 1].leftCtrl.y) * height) / this.canvasScale[1],
          (points[i + 1].x * width) / this.canvasScale[0],
          (height - points[i + 1].y * height) / this.canvasScale[1],
        );
        this.ctx.stroke();

        this.ctx.strokeStyle = 'lightgray'

        // Draw connecting line between point and control points.
        if (i > 0) {
          this.ctx.beginPath();
          this.ctx.moveTo(x, y);
          this.ctx.lineTo(
            x + points[i].leftCtrl.x * width / this.canvasScale[0],
            y - points[i].leftCtrl.y * height / this.canvasScale[1],
          )
          this.ctx.stroke();
        }

        if (i < this.points.length - 1) {
          this.ctx.beginPath();
          this.ctx.moveTo(x, y);
          this.ctx.lineTo(
            x + points[i].rightCtrl.x * width / this.canvasScale[0],
            y - points[i].rightCtrl.y * height / this.canvasScale[1],
          )
          this.ctx.stroke();
        }
      }
      
      // Draw connecting line between last point and left control point.
      const i = points.length - 1;

      const x = points[i].x * width / this.canvasScale[0];
      const y = (height - points[i].y * height) / this.canvasScale[1];

      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(
        x + points[i].leftCtrl.x * width / this.canvasScale[0],
        y - points[i].leftCtrl.y * height / this.canvasScale[1],
      )
      this.ctx.stroke();

      // Draw the points
      for (let i = 0; i < points.length; i += 1) {
        const x = points[i].x * width / this.canvasScale[0];
        const y = (height - points[i].y * height) / this.canvasScale[1];
  
        // Draw the point
        this.renderPoint(x, y, 'lightblue', 'lightblue');  

        // Draw the left control point
        if (i > 0) {
          this.renderPoint(
            x + points[i].leftCtrl.x * width / this.canvasScale[0],
            y - points[i].leftCtrl.y * height / this.canvasScale[1],
            'coral',
            'coral',
          );  
        }

        // Draw the left control point
        if (i < this.points.length - 1) {
          this.renderPoint(
            x + points[i].rightCtrl.x * width / this.canvasScale[0],
            y - points[i].rightCtrl.y * height / this.canvasScale[1],
            'coral',
            'coral',
          );  
        }
      }
    }
  }

  hitTest(x: number, y: number) {
    const width = this.element?.width ?? 0;
    const height = this.element?.height ?? 0;

    let selectedPoint: { point: PSCurvePoint, subpoint: Subpoint } | undefined = undefined;
    let closestDistance: number | undefined = undefined;

    for (let i = 0; i < this.points.length; i += 1) {
      const point = this.points[i];

      let d = vec2.distance(
        vec2.create(x * width / this.canvasScale[0], (height - y * height) / this.canvasScale[1]),
        vec2.create(point.x * width / this.canvasScale[0], (height - point.y * height) / this.canvasScale[1]),
      )

      if (d <= this.radius) {
        if (closestDistance === undefined || d < closestDistance) {
          selectedPoint = { point, subpoint: Subpoint.Main };
          closestDistance = d;
        }
      }

      // Test left control point
      if (i > 0) {
        d = vec2.distance(
          vec2.create(x * width / this.canvasScale[0], (height - y * height) / this.canvasScale[1]),
          vec2.create((point.x + point.leftCtrl.x) * width / this.canvasScale[0], (height - (point.y + point.leftCtrl.y) * height) / this.canvasScale[1]),
        )
  
        if (d <= this.radius) {
          if (closestDistance === undefined || d < closestDistance) {
            selectedPoint = { point, subpoint: Subpoint.LeftCtrl };
            closestDistance = d;
          }
        }  
      }

      // Test right control point
      if (i < this.points.length - 1) {
        d = vec2.distance(
          vec2.create(x * width / this.canvasScale[0], (height - y * height) / this.canvasScale[1]),
          vec2.create((point.x + point.rightCtrl.x) * width / this.canvasScale[0], (height - (point.y + point.rightCtrl.y) * height) / this.canvasScale[1]),
        )
  
        if (d <= this.radius) {
          if (closestDistance === undefined || d < closestDistance) {
            selectedPoint = { point, subpoint: Subpoint.RightCtrl };
            closestDistance = d;
          }
        }        
      }
    }

    return selectedPoint;
  }
}

export default CurveRenderer;
