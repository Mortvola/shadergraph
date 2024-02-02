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
    renderer2d.setTranslation(
      renderer2d.translate[0] - event.deltaX / 2,
      renderer2d.translate[1] - event.deltaY / 2,
    )
  }

  const getTransform = () => ({
      transform: `translate(${renderer2d.translate[0]}px,${renderer2d.translate[1]}px)`,
  })

  if (!graph) {
    return null;    
  }
  
  return (
    <div ref={ref} className={styles.container} onWheel={handleWheel}>
        {
          graph.nodes.map((gn) => (
            <Node graph={graph} key={gn.id} node={gn} parentRef={ref} style={getTransform()} />
          ))
        }
    </div>
  )
})

export default NodesContainer;
