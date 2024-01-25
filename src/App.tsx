import React from 'react';
import './App.scss';
import ShaderEditor from './ShaderEditor/ShaderEditor';
import MainView from './MainView';
import { useStores } from './State/store';
import Http from './Http/src';
import { MaterialDescriptor } from './Renderer/Materials/MaterialDescriptor';
import Graph from './State/Graph';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';

const App: React.FC = observer(() => {
  const store = useStores();
  const [editShader, setEditShader] = React.useState<number | null>(null);

  const handleEditShader = (id: number) => {
    (async () => {
      const response = await Http.get<{ name: string, descriptor: MaterialDescriptor }>(`/shader-descriptors/${id}`)

      if (response.ok) {
        const descriptor = await response.body();

        runInAction(() => {
          store.graph = new Graph(store, id, descriptor.name, descriptor.descriptor);    
        })
      }
    })()
  }

  const handleEditorHide = () => {
    store.graph = null;
  }

  return (
    <>
      {
        store.graph
          ? <ShaderEditor graph={store.graph} onHide={handleEditorHide} />
          : <MainView onEditShader={handleEditShader} />
      }
    </>
  )
})

export default App;
