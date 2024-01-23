import React from 'react';
import { useStores } from '../State/store';
import Node from './Node';
import { observer } from 'mobx-react-lite';

type PropsType = {
  parent: React.RefObject<HTMLDivElement>,
}

const Graph: React.FC<PropsType> = observer(({
  parent,
}) => {
  const { graph } = useStores();

  if (!graph) {
    return null;    
  }

  return (
    <>
      {
        graph.nodes.map((gn) => (
          <Node graph={graph} key={gn.id} node={gn} parentRef={parent} />
        ))
      }
    </>
  )
})

export default Graph;
