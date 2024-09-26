import React from 'react';
import { type PropertyBaseInterface } from '../Renderer/Properties/Types';
import styles from './Overrides.module.scss';

type PropsType = {
  property: PropertyBaseInterface,
}

const OverrideComparison: React.FC<PropsType> = ({
  property
}) => {
  const handleRevertClick = () => {
    property.revertOverride();
  }

  return (
    <div className={styles.comparison}>
      <label>
        { `${property.name}:` }
        <div>{property.toString()}</div>
        <div>{property.base?.toString()}</div>
      </label>
      <div className={styles.buttons}>
        <button onClick={handleRevertClick}>Revert</button>
        <button>Apply</button>
      </div>
    </div>
  )
}

export default OverrideComparison;
