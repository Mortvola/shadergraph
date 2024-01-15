import React from 'react';
import Node from './Node';
import Canvas3d from './Canvas3d';
import { useStores } from './State/store';
import { observer } from 'mobx-react-lite';
import Canvas2d from './Canvas2d';

const Container: React.FC = observer(() => {
  const { graph } = useStores();

  return (
    <div className="App">
      <Canvas2d />
      {
        graph.nodes.map((gn) => (
          <Node node={gn} />
        ))
      }
      <div className="preview">
        <Canvas3d />
      </div>
    </div>
  )
})

export default Container;