import React from 'react';
// import { isPrefabInstanceObject } from '../Scene/Types/PrefabNodeInstance';
import { isPropertyOverride, type ObjectOverrides, type SceneObjectInterface } from '../Scene/Types/Types';
import styles from './Overrides.module.scss';
import PopupButton from './PopupButton';
import OverrideComparison from './OverrideComparison';
import { Position } from './PopupWrapper';
import OverrideConnection from './OverrideConnection';

type PropsType = {
  sceneNode: SceneObjectInterface,
}

const Overrides: React.FC<PropsType> = ({
  sceneNode,
}) => {
  const [overrides, setOverrides] = React.useState<ObjectOverrides[]>([])

  // React.useEffect(() => {
  //   if (isPrefabInstanceObject(sceneNode)) {
  //     setOverrides(sceneNode.prefabInstance.getOverrides())
  //   }
  // }, [])

  return (
    <div className={styles.layout}>
      <div>{sceneNode.name}</div>
      <div className={styles.body}>
        {
          overrides.map((object) => (
            <div>
              <div key={object.object.id}>{object.object.name}</div>
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

                    return (
                      <PopupButton
                        className={styles.overridesButton}
                        label={override.connectedObject.name}
                        position={Position.left}
                      >
                        <OverrideConnection connectedObject={override.connectedObject} />
                      </PopupButton>
                    )
                  })
                }
              </div>
            </div>
          ))
        }
      </div>
      <div className={styles.footer}>
        <button>Revert All</button>
        <button>Apply All</button>
      </div>
    </div>
  )
}

export default Overrides;
