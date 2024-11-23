import React from 'react';
import styles from './Overrides.module.scss';
import PopupButton from './PopupButton';
import { Position } from './PopupWrapper';
import OverrideConnection from './OverrideConnection';
import type TreeNode from '../Scene/Types/TreeNode';
import { observer } from 'mobx-react-lite';
import ComponentComparison from './ComponentComparison';
import HeaderComparison from './HeaderComparison';
import { ComponentType } from '../Renderer/Types';

type PropsType = {
  root: TreeNode,
}

const Overrides: React.FC<PropsType> = observer(({
  root,
}) => {
  const renderTree = () => {
    const connections: React.ReactNode[] = [];

    if (root.modifierNode !== undefined) {
      type StackEntry = { node: TreeNode, level: number }
      let stack: StackEntry[] = [{ node: root, level: 0 }];

      while (stack.length > 0) {
        const { node, level } = stack[0];
        stack = stack.slice(1)

        let fontWeight: string | undefined = undefined

        const pathId = node.getPathId(root.modifierNode)
        const mod = root.modifierNode.modifications.get(pathId)

        if (mod?.sceneObject.name !== undefined) {
          fontWeight = 'bold'
        }

        if (node.parentModifierNode && node.isTopLevel) {
          connections.push(
            <PopupButton
              key={`${node.getPathId(root.modifierNode)}`}
              className={styles.overridesButton}
              label={node.sceneObject.header.name.get()}
              position={Position.left}
              style={{ marginLeft: `${level}rem`, fontWeight: 'bold' }}
            >
              <OverrideConnection connection={node} />
            </PopupButton>,
          )
        } else if (mod?.sceneObject.name !== undefined) {
          const baseObject = node.scene?.getObject(node.sceneObject.id)

          if (baseObject !== undefined) {
            connections.push(
              <PopupButton
                key={`${node.getPathId(root.modifierNode)}`}
                className={styles.overridesButton}
                label={node.sceneObject.header.name.get()}
                position={Position.left}
                style={{ marginLeft: `${level}rem`, fontWeight: 'bold' }}
              >
                <HeaderComparison node={node} baseObject={baseObject} object={node.sceneObject} />
              </PopupButton>,
            )
          }
        } else {
          connections.push(
            <div
              key={`${node.getPathId(root.modifierNode)}`}
              style={{ marginLeft: `${level}rem`, fontWeight }}
            >
              {node.sceneObject.header.name.get()}
            </div>,
          )
        }

        if (mod) {
          for (const k of Object.keys(mod.sceneObject)) {
            if (k !== ComponentType.Self) {
              const component = node.sceneObject.components[k]

              if (component !== undefined) {
                const baseObject = node.scene?.getObject(node.sceneObject.id)
                const baseComponent = baseObject?.components[k]

                if (baseComponent !== undefined) {
                  connections.push(
                    <PopupButton
                      key={`${node.getPathId(root.modifierNode)}`}
                      className={styles.overridesButton}
                      label={k}
                      position={Position.left}
                      style={{ marginLeft: `${level + 1}rem`, fontWeight: 'bold' }}
                    >
                      <ComponentComparison
                        node={node}
                        baseComponent={baseComponent}
                        component={component}
                      />
                    </PopupButton>,
                  )
                }
              }
            }
          }
        }

        const children: StackEntry[] = node.children.map((child) => ({
          node: child, level: level + 1,
        }))

        stack = [
          ...children,
          ...stack,
        ]
      }
    }

    return connections;
  }

  return (
    <div className={styles.layout}>
      {/* <div>{node.nodeObject.header.name.get()}</div> */}
      <div className={styles.body}>
        {
          // overrides.map((object) => (
          //   <div>
          //     <div key={object.object.node?.id}>{object.object.header.name.get()}</div>
          //     <div className={styles.overrides}>
          //       {
          //         object.overrides.map((override) => {
          //           if (isPropertyOverride(override)) {
          //             return (
          //               <PopupButton
          //                 className={styles.overridesButton}
          //                 label={override.property.name}
          //                 position={Position.left}
          //               >
          //                 <OverrideComparison property={override.property} />
          //               </PopupButton>
          //             )
          //           }

          //           return null
          //         })
          //       }
          //     </div>
          //   </div>
          // ))
        }
        {
          // node.connectionOverrides.map((node) => (
          //   <PopupButton
          //     className={styles.overridesButton}
          //     label={node.nodeObject.header.name.get()}
          //     position={Position.left}
          //   >
          //     <OverrideConnection connection={node} />
          //   </PopupButton>
          // ))
        }
        {
          renderTree()
        }
      </div>
      <div className={styles.footer}>
        <button>Revert All</button>
        <button>Apply All</button>
      </div>
    </div>
  )
})

export default Overrides;
