import React from 'react';
import { useStores } from '../State/store';
import { observer } from 'mobx-react-lite';
import NodesContainer from './NodesContainer';

const Graph: React.FC = observer(() => {
  const { graph } = useStores();

  if (!graph) {
    return null;
  }

  return (
    <NodesContainer />
  )
})

export default Graph;
