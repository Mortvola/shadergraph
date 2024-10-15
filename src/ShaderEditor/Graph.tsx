import React from 'react';
import { useStores } from '../State/store';
import Node from './Node';
import { observer } from 'mobx-react-lite';
import NodesContainer from './NodesContainer';

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
    <NodesContainer />
  )
})

export default Graph;
