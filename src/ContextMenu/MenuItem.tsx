import React from 'react';
import { MenuActionRecord } from './types';

type PropsType = {
  x: number,
  y: number,
  item: MenuActionRecord
}

const MenuItem: React.FC<PropsType> = ({
  x,
  y,
  item,
}) => {
  const handleClick = () => {
    item.action(x, y);
  }

  return (
    <div onClick={handleClick}>{item.name}</div>
  )
}

export default MenuItem;
