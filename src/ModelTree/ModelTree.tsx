import { observer } from 'mobx-react-lite';
import React from 'react';
import { useStores } from '../State/store';
import { SceneNodeInterface } from '../Renderer/types';
import { isContainerNode } from '../Renderer/Drawables/SceneNodes/ContainerNode';
import { isDrawableNode } from '../Renderer/Drawables/SceneNodes/utils';
import MeshNode from './MeshNode';

const ModelTree: React.FC = observer(() => {
  const { mainViewModeler: { model }} = useStores();

  if (model === null) {
    return null;
  }

  const renderTree = () => {
    const elements: JSX.Element[] = [];

    let stack: { level: number, node: SceneNodeInterface }[] = [{ level: 0, node: model }];

    while (stack.length > 0) {
      const node = stack[0];
      stack = stack.slice(1);

      if (isDrawableNode(node.node)) {
        elements.push(
          <MeshNode node={node.node} level={node.level} />
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

    return elements;
  }

  return (
    <>
      {
        renderTree()        
      }
    </>
  )
})

export default ModelTree;
