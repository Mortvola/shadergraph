import React from 'react';
import { gpu } from '../Renderer/Gpu';
import Renderer2d from '../Renderer2d';

type PropsType = {
  renderer2d?: Renderer2d,
  onClick?: (event: React.MouseEvent<HTMLCanvasElement>) => void,
  onPointerDownCapture?: (event: React.PointerEvent<HTMLCanvasElement>) => void,
  onPointerMoveCapture?: (event: React.PointerEvent<HTMLCanvasElement>) => void,
  onPointerUpCapture?: (event: React.PointerEvent<HTMLCanvasElement>) => void,
  onMouseMove?: (event: React.MouseEvent<HTMLCanvasElement>) => void,
}

const Canvas2d = React.forwardRef<HTMLCanvasElement, PropsType>(({
  renderer2d,
  onClick,
  onPointerDownCapture,
  onPointerMoveCapture,
  onPointerUpCapture,
  onMouseMove,
}, forwardedRef) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const element = canvasRef.current;
    
    if (element) {
      element.focus();

      if (renderer2d) {
        renderer2d.setCanvas(element);
      }
    }
  }, [renderer2d])
  
  React.useEffect(() => {
    const element = canvasRef.current;

    if (element) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const dpr = Math.max(devicePixelRatio, 2);

          const width = entry.devicePixelContentBoxSize?.[0].inlineSize ??
            entry.contentBoxSize[0].inlineSize * dpr;
          const height = entry.devicePixelContentBoxSize?.[0].blockSize ??
            entry.contentBoxSize[0].blockSize * dpr;

          const canvas = entry.target as HTMLCanvasElement;
          canvas.width = Math.max(1, Math.min(width, gpu.device.limits.maxTextureDimension2D ?? 1));
          canvas.height = Math.max(1, Math.min(height, gpu.device.limits.maxTextureDimension2D ?? 1));

          const rect = canvas.getBoundingClientRect();

          if (renderer2d) {
            renderer2d.setCanvasScale(canvas.width / rect.width, canvas.height / rect.height);
          }
        }
      })

      try {
        resizeObserver.observe(element, { box: 'device-pixel-content-box' });
      }
      catch (error) {
        resizeObserver.observe(element, { box: 'content-box' });
      }

      return () => resizeObserver.disconnect();
    }
  }, [renderer2d]);

  return (
    <canvas
      ref={
        (instance) => {
          canvasRef.current = instance;

          if (typeof forwardedRef === "function") {
            forwardedRef(instance);
          } else if (typeof forwardedRef === "object" && forwardedRef !== null) {
            forwardedRef.current = instance;
          }  
        }
      }
      onClick={onClick}
      onPointerDownCapture={onPointerDownCapture}
      onPointerMoveCapture={onPointerMoveCapture}
      onPointerUpCapture={onPointerUpCapture}
      onMouseMove={onMouseMove}
    />
  )
})

export default Canvas2d;
