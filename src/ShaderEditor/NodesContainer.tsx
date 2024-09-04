import React from 'react';
import styles from './NodesContainer.module.scss';
import { useStores } from '../State/store';
import Node from './Node';
import { shaderGraphRenderer } from '../Main';
import { observer } from 'mobx-react-lite';

type PropsType = {
  children?: React.ReactNode,
}

const NodesContainer: React.FC<PropsType> = observer(({
  children,
}) => {
  const { graph } = useStores();

  const ref = React.useRef<HTMLDivElement>(null)

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    if (event.ctrlKey) {
      shaderGraphRenderer.changeScale(
        -event.deltaY / 1024,
      )  
    }
    else {
      shaderGraphRenderer.setTranslation(
        shaderGraphRenderer.translate[0] - event.deltaX / 2,
        shaderGraphRenderer.translate[1] - event.deltaY / 2,
      )  
    }
  }

  React.useEffect(() => {
    const element = ref.current;

    if (element) {
      const rect = element.getBoundingClientRect()

      shaderGraphRenderer.setOrigin({ x: rect.width / 2, y: rect.height / 2 })
    }
  }, [])

  if (!graph) {
    return null;    
  }
  
  return (
    <div
      ref={ref}
      className={styles.container}
      onWheel={handleWheel}
    >
      {
        graph.graph.fragment.nodes.map((gn) => {
          // console.log(renderer2d.scale)
          return (
            <Node
              graph={graph}
              key={gn.id}
              node={gn}
              parentRef={ref}
              translate={{ x: shaderGraphRenderer.translate[0], y: shaderGraphRenderer.translate[1]}}
              scale={shaderGraphRenderer.scale}
              origin={shaderGraphRenderer.origin}
            />
          )
        })
      }
    </div>
  )
})

export default NodesContainer;
