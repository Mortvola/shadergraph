import React from 'react';
import { useStores } from '../State/store';
import { PropertyInterface } from '../shaders/ShaderBuilder/Types';
import { MenuItemRecord } from './MenuItems';

type PropsType = {
  x: number,
  y: number,
  item: MenuItemRecord<PropertyInterface>;
}

const MenuItem: React.FC<PropsType> = ({
  x,
  y,
  item,
}) => {
  const { graph } = useStores();

  const handleClick = () => {
    graph.addProperty(item.property())
  }

  return (
    <div onClick={handleClick}>{item.name}</div>
  )
}

export default MenuItem;
