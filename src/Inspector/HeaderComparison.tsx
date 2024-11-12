import React from 'react';
import styles from './ComponentComparison.module.scss';
import { type SceneObjectInterface } from '../Scene/Types/Types';
import Header from './Header';
import type TreeNode from '../Scene/Types/TreeNode';
import Dropdown from 'react-bootstrap/Dropdown';
import type ModifierNode from '../Scene/Types/ModifierNode';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import Http from '../Http/src';

type PropsType = {
  root: TreeNode,
  node: TreeNode,
  baseObject: SceneObjectInterface,
  object: SceneObjectInterface,
}

const HeaderComparison: React.FC<PropsType> = observer(({
  root,
  node,
  baseObject,
  object,
}) => {
  const applyOverride = async (modifierNode: ModifierNode, key: string) => {
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

          const root = n.sceneRoot.nodeObject
          const modifierNode = n.modifierNode

          t.push(
            <Dropdown.Item onClick={() => applyOverride(modifierNode, 'name')}>
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
    <div className={styles.compare}>
      <div>
        <Dropdown>
          <Dropdown.Toggle>
            Apply
          </Dropdown.Toggle>

          <Dropdown.Menu>
            { targets() }
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <Header className={styles.component} header={baseObject.header}/>
      <Header className={styles.component} header={object.header}/>
    </div>
  )
})

export default HeaderComparison;
