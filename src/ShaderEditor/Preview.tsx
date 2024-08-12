import React from 'react';
import Canvas3d from '../Canvas3d';
import styles from './Preview.module.scss';
import Draggable from './Draggable';
import { useStores } from '../State/store';
import Mesh from '../Renderer/Drawables/Mesh';
import { plane as planeShape } from '../Renderer/Drawables/Shapes/plane';
import DrawableNode from '../Renderer/Drawables/SceneNodes/DrawableNode';
import { runInAction } from 'mobx';

const plane = await DrawableNode.create(await Mesh.create(planeShape(1, 1), 1));
plane.name = 'Plane';

const Preview: React.FC = () => {
  const store = useStores();
  const { shaderPreview, previewModeler } = store;

  type SizeInfo = { x: number, y: number, width: number, height: number };

  const [position, setPosition] = React.useState<SizeInfo>({ x: 100, y: 100, width: 200, height: 200});

  const handlePositionChange = (deltaX: number, deltaY: number) => {
    setPosition((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY, width: prev.width, height: prev.height }));
  }

  const handleResize = (x: number, y: number, width: number, height: number) => {
    setPosition({ x, y, width, height });
  }

  React.useEffect(() => {
    const positionItem = localStorage.getItem('preview')

    if (positionItem) {
      const pos = JSON.parse(positionItem);
      setPosition(pos);
    }

  }, []);

  React.useEffect(() => {
    const timer  = setInterval(() => {
      localStorage.setItem('preview', JSON.stringify(position))
    }, 5000)

    return () => {
      clearInterval(timer);
    }
  }, [position]);

  const handleModelChange: React.ChangeEventHandler<HTMLSelectElement> = async (event) => {
    if (event.target.value === '-1') {
      await previewModeler.assignModel(plane);
      store.graph?.applyMaterial()
    }
    else {
      const modelItem = store.project.getItemByItemId(parseInt(event.target.value, 10), 'model')

      if (modelItem) {
        const model = await store.getModel(modelItem)

        if (model) {
          previewModeler.assignModel(model)
          store.graph?.applyMaterial()
        }
      }
    }
  }

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    if (event.ctrlKey) {
      shaderPreview?.camera.changeOffset(event.deltaY * 0.01);
    }
    else {
      shaderPreview?.camera.changeRotation(event.deltaX * 0.2, event.deltaY * 0.2)
    }

    event.stopPropagation();
  }

  React.useEffect(() => {
    if (previewModeler.model === null) {
      previewModeler.assignModel(plane);
    }
  }, [previewModeler]);

  return (
    <Draggable onPositionChange={handlePositionChange} position={position} onResize={handleResize} resizable >
      <div className={styles.preview} onWheel={handleWheel}>
        <div>
          <div>Preview</div>
          <select onChange={handleModelChange}>
            <option key={-1} value={-1}>{'Plane'}</option>
            {
              store.project.getAllItemsOfType('model').map((m) => (
                <option key={m.id} value={m.itemId ?? -1}>{m.name}</option>
              ))
            }              
          </select>
        </div>
        <Canvas3d renderer={shaderPreview} />
      </div>
    </Draggable>
  )
}

export default Preview;

