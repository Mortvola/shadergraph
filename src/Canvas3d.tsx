import React from 'react';
import { gpu } from './Renderer/Gpu';
import type Renderer from './Renderer/Renderer';

type PropsType = {
  renderer: Renderer,
  onWheel?: (event: React.WheelEvent<HTMLDivElement>) => void,
}

const Canvas3d: React.FC<PropsType> = ({
  renderer,
  onWheel,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const element = canvasRef.current;

    if (element) {
      (async () => {
        await renderer.setCanvas(element);
        renderer.start();
      })()
    }
  }, [renderer])

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
          canvas.height = Math.max(1, Math.min(height, gpu?.device.limits.maxTextureDimension2D ?? 1));
        }
      })

      try {
        resizeObserver.observe(element, { box: 'device-pixel-content-box' });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      catch (error) {
        resizeObserver.observe(element, { box: 'content-box' });
      }

      return () => resizeObserver.disconnect();
    }
  }, []);

  return (
    <div className="canvas-wrapper" onWheel={onWheel}>
      <canvas
        ref={canvasRef}
      />
    </div>
  )
}

export default Canvas3d;
