import React from 'react';
import type { MenuActionRecord } from './types';

type PropsType = {
  originPosition: [number, number]
  item: MenuActionRecord
}

const MenuItem: React.FC<PropsType> = ({
  originPosition,
  item,
}) => {
  const handleClick = () => {
    item.action(originPosition[0], originPosition[1]);
  }

  return (
    <div onClick={handleClick}>{item.name}</div>
  )
}

export default MenuItem;
