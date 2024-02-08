import { observer } from 'mobx-react-lite';
import React from 'react';
import { useStores } from '../../State/store';
import { DrawableNodeInterface, SceneNodeInterface } from '../../Renderer/types';
import { isContainerNode } from '../../Renderer/Drawables/SceneNodes/ContainerNode';
import { isDrawableNode } from '../../Renderer/Drawables/SceneNodes/utils';
import MeshNode from './MeshNode';
import { runInAction } from 'mobx';
import { GameObjectInterface, GameObjectRecord, ModelItem } from '../../State/types';
import Http from '../../Http/src';

type PropsType = {
  modelItem: ModelItem,
}

const ModelTree: React.FC<PropsType> = observer(({
  modelItem,
}) => {
  const store = useStores();
  const { project: { selectedItem }, materials} = store;

  const [model, setModel] = React.useState<SceneNodeInterface | null>(null)

  React.useEffect(() => {
    (async () => {
      const m = await store.modeler.getModel(`/models/${modelItem.id}`)

      if (m) {
        setModel(m)
      }
    })()
  }, [modelItem.id, store.modeler])

  // let gameObject: GameObjectInterface | null = null;
  // if (selectedItem && selectedItem.type === 'object') {
  //   gameObject = selectedItem.item as GameObjectInterface
  // }

  // if (model === null) {
  //   return null;
  // }

  // const saveGameObject = async (object: GameObjectInterface) => {
  //   const response = await Http.patch<GameObjectRecord, void>(`/game-objects/${object.id}`, {
  //     id: object.id,
  //     name: object.name,
  //     object: {
  //       modelId: object.modelId,
  //       materials: object.materials,
  //     }
  //   });

  //   if (response.ok) {

  //   }
  // }

  const handleMaterialAssignment = (node: DrawableNodeInterface, materialId: number) => {
    // if (gameObject) {
    //   runInAction(() => {
    //     if (gameObject) {
    //       if (!gameObject.materials) {
    //         gameObject.materials = {}
    //       }
    
    //       gameObject.materials = {
    //         ...gameObject.materials,
    //         [node.name]: materialId,
    //       }

    //       saveGameObject(gameObject)
    //     }
    //   })

    //   materials.applyMaterial(materialId, node)
    // }
  }

  const renderTree = () => {
    const elements: JSX.Element[] = [];

    if (model) {
      let stack: { level: number, node: SceneNodeInterface }[] = [{ level: 0, node: model }];

      while (stack.length > 0) {
        const node = stack[0];
        stack = stack.slice(1);

        if (isDrawableNode(node.node)) {
          elements.push(
            <MeshNode node={node.node} level={node.level} onMaterialAssignment={handleMaterialAssignment} />
          )  
        }
        else {
          elements.push(
            <div style={{ marginLeft: 16 * node.level }}>
              {node.node.name ? node.node.name : 'Unnamed'}
            </div>
          )  
        }

        if (isContainerNode(node.node)) {
          stack = node.node.nodes.map((n) => ({
            level: node.level + 1,
            node: n,
          }))
        }
      }
    }

    return elements;
  }

  let modelName = ''

  // if (gameObject) {
  //   const item = gameObject.items.find((o) => o.type === 'model');

  //   if (item) {
      modelName = store.project.getItemByItemId(modelItem.id, 'model')?.name ?? ''
  //   }
  // }

  // if (gameObject) {
    return (
      <div>
        <div>{`Model: ${modelName}`}</div>
        {
          renderTree()        
        }
      </div>
    )  
  // }

  // return null;
})

export default ModelTree;
