import React from 'react';
// import { isPrefabInstanceObject } from '../Scene/Types/PrefabNodeInstance';
import { isPropertyOverride, type ObjectOverrides } from '../Scene/Types/Types';
import styles from './Overrides.module.scss';
import PopupButton from './PopupButton';
import OverrideComparison from './OverrideComparison';
import { Position } from './PopupWrapper';
import OverrideConnection from './OverrideConnection';
import type TreeNode from '../Scene/Types/TreeNode';
import { observer } from 'mobx-react-lite';

type PropsType = {
  node: TreeNode,
}

const Overrides: React.FC<PropsType> = observer(({
   node,
}) => {
  const [overrides, setOverrides] = React.useState<ObjectOverrides[]>([])

  // React.useEffect(() => {
  //   if (isPrefabInstanceObject(sceneNode)) {
  //     setOverrides(sceneNode.prefabInstance.getOverrides())
  //   }
  // }, [])

  return (
    <div className={styles.layout}>
      <div>{node.nodeObject.node?.name}</div>
      <div className={styles.body}>
        {
          overrides.map((object) => (
            <div>
              <div key={object.object.node?.id}>{object.object.node?.name}</div>
              <div className={styles.overrides}>
                {
                  object.overrides.map((override) => {
                    if (isPropertyOverride(override)) {
                      return (
                        <PopupButton
                          className={styles.overridesButton}
                          label={override.property.name}
                          position={Position.left}
                        >
                          <OverrideComparison property={override.property} />
                        </PopupButton>
                      )
                    }

                    return null
                  })
                }
              </div>
            </div>
          ))
        }
        {
          node.connectionOverrides.map((connection) => (
            <PopupButton
              className={styles.overridesButton}
              label={connection.name}
              position={Position.left}
            >
              <OverrideConnection connection={connection} />
            </PopupButton>
          ))
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
