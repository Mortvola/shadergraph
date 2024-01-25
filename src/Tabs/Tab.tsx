import React from 'react';

type PropsType = {
  children: React.ReactNode,
  tabKey: string,
  onSelect: (key: string) => void,
}

const Tab: React.FC<PropsType> = ({
  children,
  tabKey,
  onSelect,
}) => (
  <div onClick={() => onSelect(tabKey)}>{children}</div>
)

export default Tab;
