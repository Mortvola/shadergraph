import React from 'react';
import { PSCurvePoint } from '../Renderer/ParticleSystem/Types';
import { observer } from 'mobx-react-lite';
import Canvas2d from '../ShaderEditor/Canvas2d';
import CurveRenderer, { Subpoint } from './CurveRenderer';
import PSCurve from '../Renderer/Properties/PSCurve';
import { vec2 } from 'wgpu-matrix';

type PropsType = {
  value: PSCurve,
}

const CurveGraph: React.FC<PropsType> = observer(({
  value,
}) => {
  const graphRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [graphRect, setGraphRect] = React.useState<{ left: number, top: number, width: number, height: number}>({ left: 0, top: 0, width: 0, height: 0})
  const renderer = React.useRef<CurveRenderer>(new CurveRenderer())
  const [dragPoint, setDragPoint] = React.useState<{ point: PSCurvePoint, subpoint: Subpoint }>();

  React.useEffect(() => {
    const element = graphRef.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      setGraphRect({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
    }
  }, [])

  React.useEffect(() => {
    renderer.current.updateCurve(value.points);
  }, [value.points])

  const handleMove = (x: number, y: number) => {
    if (dragPoint) {
      const index = value.points.findIndex((p) => p.id === dragPoint.point.id);

      if (index !== -1) {
        let updatedPoint: PSCurvePoint;

        switch(dragPoint.subpoint) {
          case Subpoint.Main:
            updatedPoint = {
              ...value.points[index],
              x: Math.max(0, Math.min(1, (x - graphRect.left) / graphRect.width)),
              y: Math.max(0, Math.min(1, (graphRect.height - (y - graphRect.top)) / graphRect.height)),
            };
  
            break;

          case Subpoint.LeftCtrl: {
            const leftCtrl = {
              x: Math.min(0, Math.max(0, Math.min(1, (x - graphRect.left) / graphRect.width)) - dragPoint.point.x),
              y: Math.max(0, Math.min(1, (graphRect.height - (y - graphRect.top)) / graphRect.height)) - dragPoint.point.y,
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
              x: Math.max(0, Math.max(0, Math.min(1, (x - graphRect.left) / graphRect.width)) - dragPoint.point.x),
              y: Math.max(0, Math.min(1, (graphRect.height - (y - graphRect.top)) / graphRect.height)) - dragPoint.point.y,
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

        value.setPoints(points)
      }
    }
  }

  const handlePointerDown: React.PointerEventHandler<HTMLCanvasElement> = (event) => {
    const element = canvasRef.current;

    if (element) {
      const x = (event.clientX - graphRect.left) / graphRect.width;
      const y = 1 - (event.clientY - graphRect.top) / graphRect.height;
  
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
      // handleMove(id, event.clientX - dragOffset.x, event.clientY - dragOffset.y)
      handleMove(event.clientX, event.clientY)
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
