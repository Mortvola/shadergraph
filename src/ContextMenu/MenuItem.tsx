import React from 'react';
import { useStores } from '../State/store';
import SampleTexture from '../shaders/ShaderBuilder/Nodes/SampleTexture';
import { GraphNodeInterface } from '../shaders/ShaderBuilder/Types';
import { MenuItemRecord } from './MenuItems';

type PropsType = {
  x: number,
  y: number,
  item: MenuItemRecord<GraphNodeInterface>
}

const MenuItem: React.FC<PropsType> = ({
  x,
  y,
  item,
}) => {
  const { graph } = useStores();

  const handleClick = () => {
    const node = new item.node();
    node.x = x;
    node.y = y;
    graph.addNode(node)
  }

  return (
    <div onClick={handleClick}>{item.name}</div>
  )
}

export default MenuItem;
