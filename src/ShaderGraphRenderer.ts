import { vec2 } from 'wgpu-matrix';
import { store } from './State/store';
import Renderer2d from './Renderer2d';
import { type PortInterface } from './Renderer/ShaderBuilder/Types';

class ShaderGraphRenderer extends Renderer2d {
  constructor(interactive = true) {
    super(interactive)
  }

  connectionPoint(port: PortInterface): [number, number] {
    return [
      (port.node.position!.x + this.translate[0]) * this.scale + (this.origin.x - this.origin.x * this.scale) + port.offsetX,
      (port.node.position!.y + this.translate[1]) * this.scale + (this.origin.y - this.origin.y * this.scale) + port.offsetY,
    ]
  }

  drawFrame = () => {
    if (this.ctx && store.graph) {
      this.ctx.clearRect(0, 0, this.element?.width ?? 0, this.element?.height ?? 0);

      for (const edge of store.graph.graph.fragment.edges) {
        const [startX, startY] = this.connectionPoint(edge.output)
        const [endX, endY] = this.connectionPoint(edge.input)

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

        this.ctx.strokeStyle = 'white';
        this.ctx.stroke();
      }

      if (store.graph && store.graph.dragConnector !== null) {
        const point1 = this.connectionPoint(store.graph.dragConnector.port)
        const point2 = store.graph.dragConnector.point;

        this.ctx.beginPath();
        this.ctx.moveTo(point1[0], point1[1]);
        this.ctx.lineTo(point1[0] + 10, point1[1])
        this.ctx.lineTo(point2[0], point2[1]);
        this.ctx.strokeStyle = 'white';
        this.ctx.stroke();
      }
    }
  }
}

export default ShaderGraphRenderer;
