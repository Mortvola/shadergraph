import React from 'react';
import styles from './NodesContainer.module.scss';
import { useStores } from '../State/store';
import Node from './Node';
import { renderer2d } from '../Main';
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
      renderer2d.changeScale(
        -event.deltaY / 1024,
      )  
    }
    else {
      renderer2d.setTranslation(
        renderer2d.translate[0] - event.deltaX / 2,
        renderer2d.translate[1] - event.deltaY / 2,
      )  
    }
  }

  React.useEffect(() => {
    const element = ref.current;

    if (element) {
      const rect = element.getBoundingClientRect()

      renderer2d.setOrigin({ x: rect.width / 2, y: rect.height / 2 })
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
        graph.nodes.map((gn) => {
          // console.log(renderer2d.scale)
          return (
            <Node
              graph={graph}
              key={gn.id}
              node={gn}
              parentRef={ref}
              translate={{ x: renderer2d.translate[0], y: renderer2d.translate[1]}}
              scale={renderer2d.scale}
              origin={renderer2d.origin}
            />
          )
        })
      }
    </div>
  )
})

export default NodesContainer;
