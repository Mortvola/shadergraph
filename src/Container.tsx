import React from 'react';
import Node from './Node';
import Canvas3d from './Canvas3d';

const Container: React.FC = () => {  
  return (
    <div className="App">
      <canvas />
      <Node />
      <Node />
      <div className="preview">
        <Canvas3d />
      </div>
    </div>
  )
}

export default Container;