import React from 'react';
import { Dropdown } from 'react-bootstrap';
import type TreeNode from '../Scene/Types/TreeNode';
import { runInAction } from 'mobx';
import Http from '../Http/src';
import type ModifierNode from '../Scene/Types/ModifierNode';
import { type SceneObjectInterface } from '../Scene/Types/Types';

type PropsType = {
  root: TreeNode,
  node: TreeNode,
  baseObject: SceneObjectInterface,
  key: string,
}

const OverrideApplyButton: React.FC<PropsType> = ({
  root,
  node,
  baseObject,
  key,
}) => {
  const applyOverride = async (modifierNode: ModifierNode) => {
    if (root.modifierNode === undefined) {
      throw new Error('modifier node not set')
    }

    const srcMod = root.modifierNode.getModificationEntry(node.getPathId(root.modifierNode))
    const destMod = modifierNode.getModificationEntry(node.getPathId(modifierNode))

    const payload = {
      modifierNodeId: modifierNode.id,
      sceneId: modifierNode.sceneId,
      pathId: destMod.pathId,
      source: {
        modifierNodeId: root.modifierNode.id,
        sceneId: root.modifierNode.sceneId,
        pathId: srcMod.pathId,
        key,
      },
    }

    const response = await Http.put('/api/node-modifications', payload)

    if (response.ok) {
      runInAction(() => {
        destMod.sceneObject = {
          ...destMod.sceneObject,
          [key]: srcMod.sceneObject[key],
        }

        delete srcMod.sceneObject[key]
      })

      console.log(JSON.stringify(destMod.sceneObject))
    }
  }

  const targets = () => {
    const t: React.ReactNode[] = []

    let n: TreeNode | undefined = node.sceneRoot;

    while (n) {
      if (n.sceneRoot.sceneId === node.sceneId) {
        t.push(<Dropdown.Item>{`Apply to ${baseObject.header.name.get()}`}</Dropdown.Item>)
      } else {
        if (n.modifierNode) {
          // If we reached a modifier node in the top level scene then
          // we don't need to look any further.
          if (n.modifierNode.sceneId === n.scene.root?.sceneId) {
            break;
          }

          const root = n.sceneRoot.sceneObject
          const modifierNode = n.modifierNode

          t.push(
            <Dropdown.Item onClick={() => applyOverride(modifierNode)}>
              {`Apply as override in ${root.header.name.get()}`}
            </Dropdown.Item>,
          )
        }
      }

      if (n.parentModifierNode) {
        n = n.parentModifierNode.parent
      } else {
        n = n.parent
      }

      n = n?.sceneRoot
    }

    return t.reverse();
  }

  return (
    <Dropdown>
      <Dropdown.Toggle>
        Apply
      </Dropdown.Toggle>

      <Dropdown.Menu>
        { targets() }
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default OverrideApplyButton;
