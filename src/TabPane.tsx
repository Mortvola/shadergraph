import React from 'react';

type PropsType = {
  tabKey: string,
  currentKey: string,
  children: React.ReactNode,
}

const TabPane: React.FC<PropsType> = ({
  tabKey,
  currentKey,
  children,
}) => (
  <div hidden={tabKey !== currentKey}>
    { children }
  </div>
)

export default TabPane;
