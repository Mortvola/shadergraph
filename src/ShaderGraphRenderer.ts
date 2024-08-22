import { vec2 } from "wgpu-matrix";
import { store } from "./State/store";
import Renderer2d from "./Renderer2d";

class ShaderGraphRenderer extends Renderer2d {
  constructor(interactive = true) {
    super(interactive)
  }

  drawFrame = () => {
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
  }
}

export default ShaderGraphRenderer;
