import React from 'react';
import type { PSCurvePoint } from '../Renderer/ParticleSystem/Types';
import { observer } from 'mobx-react-lite';
import Canvas2d from '../ShaderEditor/Canvas2d';
import CurveRenderer, { Subpoint } from './CurveRenderer';
import type PSCurve from '../Renderer/Properties/PSCurve';
import { vec2 } from 'wgpu-matrix';

type PropsType = {
  value: PSCurve,
}

const CurveGraph: React.FC<PropsType> = observer(({
  value,
}) => {
  const graphRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const renderer = React.useRef<CurveRenderer>(new CurveRenderer())
  const [dragPoint, setDragPoint] = React.useState<{ point: PSCurvePoint, subpoint: Subpoint }>();

  React.useEffect(() => {
    renderer.current.updateCurve(value.points);
  }, [value.points])

  const handlePointerDown: React.PointerEventHandler<HTMLCanvasElement> = (event) => {
    const element = canvasRef.current;

    if (element) {
      const canvasRect = element.getBoundingClientRect()
      const x = (event.clientX - canvasRect.left) / canvasRect.width;
      const y = 1 - (event.clientY - canvasRect.top) / canvasRect.height;

      const point = renderer.current.hitTest(x, y);

      if (point) {
        setDragPoint(point)
        element.setPointerCapture(event.pointerId);
      }
    }
  }

  const handlePointerMove: React.PointerEventHandler<HTMLCanvasElement> = (event) => {
    const element = canvasRef.current;

    if (element && element.hasPointerCapture(event.pointerId) && dragPoint) {
      const x = event.clientX
      const y = event.clientY

      const canvasRect = element.getBoundingClientRect()

      const index = value.points.findIndex((p) => p.id === dragPoint.point.id);

      if (index !== -1) {
        let updatedPoint: PSCurvePoint;

        switch(dragPoint.subpoint) {
          case Subpoint.Main:
            updatedPoint = {
              ...value.points[index],
              x: Math.max(0, Math.min(1, (x - canvasRect.left) / canvasRect.width)),
              y: Math.max(0, Math.min(1, (canvasRect.height - (y - canvasRect.top)) / canvasRect.height)),
            };

            break;

          case Subpoint.LeftCtrl: {
            const leftCtrl = {
              x: Math.min(0, Math.max(0, Math.min(1, (x - canvasRect.left) / canvasRect.width)) - dragPoint.point.x),
              y: Math.max(
                0,
                Math.min(1, (canvasRect.height - (y - canvasRect.top)) / canvasRect.height),
              ) - dragPoint.point.y,
            }

            const length = vec2.length(vec2.create(dragPoint.point.rightCtrl.x, dragPoint.point.leftCtrl.y));
            const point = vec2.scale(vec2.normalize(vec2.create(-leftCtrl.x, -leftCtrl.y)), length);

            updatedPoint = {
              ...value.points[index],
              leftCtrl,
              rightCtrl: {
                x: point[0],
                y: point[1],
              },
            };
            break;
          }

          case Subpoint.RightCtrl: {
            const rightCtrl = {
              x: Math.max(0, Math.max(0, Math.min(1, (x - canvasRect.left) / canvasRect.width)) - dragPoint.point.x),
              y: Math.max(
                0,
                Math.min(1, (canvasRect.height - (y - canvasRect.top)) / canvasRect.height),
              ) - dragPoint.point.y,
            }

            const length = vec2.length(vec2.create(dragPoint.point.leftCtrl.x, dragPoint.point.rightCtrl.y));
            const point = vec2.scale(vec2.normalize(vec2.create(-rightCtrl.x, -rightCtrl.y)), length);

            updatedPoint = {
              ...value.points[index],
              leftCtrl: {
                x: point[0],
                y: point[1],
              },
              rightCtrl,
            };
            break;
          }
        }

        const points = [
          ...value.points.slice(0, index),
          updatedPoint,
          ...value.points.slice(index + 1),
        ]

        value.setPoints(points, true)
      }
    }
  }

  const handlePointerUp: React.PointerEventHandler<HTMLCanvasElement> = (event) => {
    const element = canvasRef.current;

    if (element) {
      element.releasePointerCapture(event.pointerId);
      setDragPoint(undefined);
    }
  }

  return (
    <div ref={graphRef}>
      <Canvas2d
        ref={canvasRef}
        renderer2d={renderer.current}
        onPointerDownCapture={handlePointerDown}
        onPointerMoveCapture={handlePointerMove}
        onPointerUpCapture={handlePointerUp}
      />
    </div>
  )
})

export default CurveGraph;
