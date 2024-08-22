import { observer } from 'mobx-react-lite';
import React from 'react';
import { useStores } from '../../State/store';
import { SceneNodeInterface, DrawableComponentInterface, ModelItem } from '../../Renderer/types';
import { isSceneNode } from '../../Renderer/Drawables/SceneNodes/SceneNode';
import { isDrawableNode } from '../../Renderer/Drawables/SceneNodes/utils';
import MeshNode from './MeshNode';

type PropsType = {
  modelItem: ModelItem,
  onChange: (model: ModelItem) => void,
}

const ModelTree: React.FC<PropsType> = observer(({
  modelItem,
  onChange,
}) => {
  const store = useStores();
  // const { project: { selectedItem }, materials} = store;

  const [model, setModel] = React.useState<SceneNodeInterface | null>(null)

  React.useEffect(() => {
    (async () => {
      const m = await store.previewModeler.getModel(modelItem.id)

      if (m) {
        setModel(m)
      }
    })()
  }, [modelItem.id, store.previewModeler])

  const handleMaterialAssignment = (node: DrawableComponentInterface, materialId: number) => {
    let materials: Record<string, number> = { ...modelItem.materials }

    materials[node.name] = materialId;

    onChange({ id: modelItem.id, materials })
  }

  const renderTree = () => {
    const elements: JSX.Element[] = [];

    if (model) {
      let key = 0;
      let stack: { level: number, node: SceneNodeInterface }[] = [{ level: 0, node: model }];

      while (stack.length > 0) {
        key += 1;

        const node = stack[0];
        stack = stack.slice(1);

        if (isDrawableNode(node.node)) {
          elements.push(
            <MeshNode key={key} node={node.node} level={node.level} onMaterialAssignment={handleMaterialAssignment} />
          )  
        }
        else {
          elements.push(
            <div key={key} style={{ marginLeft: 16 * node.level }}>
              {node.node.name ? node.node.name : 'Unnamed'}
            </div>
          )  
        }

        if (isSceneNode(node.node)) {
          stack = node.node.nodes.map((n) => ({
            level: node.level + 1,
            node: n,
          }))
        }
      }
    }

    return elements;
  }

  let modelName = store.project.getItemByItemId(modelItem.id, 'model')?.name ?? ''

  return (
    <div>
      <div>{`Model: ${modelName}`}</div>
      {
        renderTree()        
      }
    </div>
  )  
})

export default ModelTree;
