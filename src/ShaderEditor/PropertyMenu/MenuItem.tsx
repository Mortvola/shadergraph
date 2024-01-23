import React from 'react';
import { PropertyInterface } from '../../Renderer/ShaderBuilder/Types';
import { MenuItemRecord } from './MenuItems';
import { GraphInterface } from '../../State/types';

type PropsType = {
  graph: GraphInterface,
  x: number,
  y: number,
  item: MenuItemRecord<PropertyInterface>;
}

const MenuItem: React.FC<PropsType> = ({
  graph,
  x,
  y,
  item,
}) => {
  const handleClick = () => {
    graph.addProperty(item.property())
  }

  return (
    <div onClick={handleClick}>{item.name}</div>
  )
}

export default MenuItem;
