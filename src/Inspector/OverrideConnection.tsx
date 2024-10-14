import React from 'react';
import styles from './Overrides.module.scss';
import TreeNode from '../Scene/Types/TreeNode';
import Http from '../Http/src';
import { PopupContext } from './PopupContext';
import { type NodesResponse } from '../Scene/Types/Types';
import { runInAction } from 'mobx';

type PropsType = {
  connection: TreeNode,
}

const OverrideConnection: React.FC<PropsType> = ({
  connection,
}) => {
  const popupContext = React.useContext(PopupContext)

  const handleRevertClick = () => {
  }

  const handleApplyClick = () => {
    const parent = connection.parent;

    if (parent) {
      (
        async () => {
          const response = await Http.patch<unknown, NodesResponse>(`/api/tree-nodes/${connection.id}`, {
            parentNodeId: parent.id,
            parentTreeId: null,
          })

          if (response.ok) {
            const body = await response.body()

            await parent.scene.loadObjects(body.objects, body.trees)

            runInAction(() => {
              connection.treeId = parent.treeId
            })
            
            popupContext.hidePopup()

            const parentNodeInfo = connection.scene.nodeMaps.get(parent.id)
            const nodeInfo = connection.scene.nodeMaps.get(connection.id)

            if (parentNodeInfo && nodeInfo) {              
              for (const [treeId, treeNode] of parentNodeInfo.treeNodes) {
                if (treeId !== parent.treeId) {
                  const node = new TreeNode(parent.scene, 'Test')

                  node.id = connection.id;
                  node.treeId = treeId;

                  const object = nodeInfo.objects.get(node.treeId)

                  if (object) {
                    node.nodeObject = object;
                    object.node = node;
                  }
            
                  treeNode.autosave = false;
                  treeNode.addNode(node)
                  treeNode.autosave = true;
                }
              }
            }
          }
        }
      )()
    }
  }

  return (
    <div className={styles.comparison}>
      <div className={styles.buttons}>
        <button onClick={handleRevertClick}>Revert</button>
        <button onClick={handleApplyClick}>Apply</button>
      </div>
    </div>
  )
}

export default OverrideConnection;
