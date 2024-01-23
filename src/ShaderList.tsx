import React from 'react';
import Http from './Http/src';
import styles from './ShaderList.module.scss';
import ShaderListEntry from './ShaderListEntry';
import { useStores } from './State/store';
import Graph from './State/Graph';
import { MaterialDescriptor } from './Renderer/Materials/MaterialDescriptor';

type PropsType = {
  onEdit: (id: number) => void,
}

const ShaderList: React.FC<PropsType> = ({
  onEdit,
}) => {
  const store = useStores();
  const [shaders, setShaders] = React.useState<{ id: number, name: string }[]>([])

  const queryList = async () => {
    const response = await Http.get<{ id: number, name: string }[]>('/shader-list');

    if (response.ok) {
      const list = await response.body()

      setShaders(list);
      console.log(list)
    }
  }

  React.useEffect(() => {
    queryList()
  }, [])

  const handleAddClick = () => {
    let descriptor: MaterialDescriptor | undefined = undefined;

    const savedItem = localStorage.getItem('material');
    if (savedItem) {
      descriptor = JSON.parse(savedItem);
    }

    store.graph = new Graph(store, undefined, 'SoulerCoaster', descriptor);
  }

  return (
    <div className={styles.list}>
      Textures
      <button type="button" onClick={handleAddClick}>Add</button>
      {
        shaders.map((s) => (
          <ShaderListEntry item={s} onEdit={onEdit} />
        ))
      }              
    </div>
  )
}

export default ShaderList;
