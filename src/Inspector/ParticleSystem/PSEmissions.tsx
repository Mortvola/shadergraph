import React from 'react';
import type Emissions from '../../Renderer/ParticleSystem/Emissions';
import NumberInput from '../NumberInput';
import Property from '../Property';
import styles from './PSEmissions.module.scss';
import { Button } from 'react-bootstrap';
import { MinusIcon, PlusIcon } from 'lucide-react';
import PSValueInput from './PSValueInput';
import { observer } from 'mobx-react-lite';
import type TreeNode from '../../Scene/Types/TreeNode';
import { ComponentType } from '../../Renderer/Types';

type PropsType = {
  emissions: Emissions,
  node: TreeNode,
}

const PSEmissions: React.FC<PropsType> = observer(({
  emissions,
  node,
}) => {
  const handleRateChange = (value: number) => {
    emissions.rate.set(value, !node.isTopLevel);
  }

  const handleAddClick = () => {
    emissions.addBurst()
  }

  const handleDeleteClick = () => {
    if (activeRow !== undefined) {
      emissions.deleteBurst(activeRow)
    }
  }

  const handleTimeChange = (index: number, value: number) => {
    emissions.updateBurstTime(index, value)
  }

  const [activeRow, setActiveRow] = React.useState<number>()

  const handleRowFocus = (index: number) => {
    setActiveRow(index)
  }

  return (
    <div>
      <Property
        label="Rate over time"
        property={emissions.rate}
        node={node}
        componentType={ComponentType.ParticleSystem}
        propertyPath="rate"
      >
        <NumberInput value={emissions.rate.get()} onChange={handleRateChange} />
      </Property>
      <div className={styles.bursts}>
        <Property
          label="Bursts"
          property={emissions.bursts}
          node={node}
          componentType={ComponentType.ParticleSystem}
          propertyPath="bursts"
        />
        <div className={styles.table}>
          <div className={styles.title}>Time</div>
          <div className={styles.title}>Count</div>
          <div className={styles.title}>Cycles</div>
          <div className={styles.title}>Probability</div>
          {
            emissions.bursts.get().map((burst, index) => (
              <>
                <div>
                  <NumberInput
                    value={burst.time}
                    onChange={(value: number) => handleTimeChange(index, value)}
                    onFocus={() => handleRowFocus(index)}
                  /></div>
                <div><PSValueInput value={burst.count} onFocus={() => handleRowFocus(index)} node={node} /></div>
                <div><NumberInput value={burst.cycles} onFocus={() => handleRowFocus(index)} /></div>
                <div><NumberInput value={burst.probability} onFocus={() => handleRowFocus(index)} /></div>
              </>
            ))
          }
        </div>
        <Button className={styles.iconButton} onClick={handleAddClick}><PlusIcon size={12} /></Button>
        <Button className={styles.iconButton} onClick={handleDeleteClick}><MinusIcon size={12} /></Button>
      </div>
    </div>
  )
})

export default PSEmissions;
