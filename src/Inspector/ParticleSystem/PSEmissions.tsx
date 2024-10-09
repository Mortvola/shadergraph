import React from 'react';
import type Emissions from '../../Renderer/ParticleSystem/Emissions';
import NumberInput from '../NumberInput';
import Property from '../Property';
import styles from './PSEmissions.module.scss';
import { Button } from 'react-bootstrap';
import { MinusIcon, PlusIcon } from 'lucide-react';
import PSValueInput from './PSValueInput';
import PSValue from '../../Renderer/Properties/PSValue';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';

type PropsType = {
  emissions: Emissions,
}

const PSEmissions: React.FC<PropsType> = observer(({
  emissions,
}) => {
  const handleRateChange = (value: number) => {
    emissions.rate.set(value, true);
  }
  
  const handleAddClick = () => {
    runInAction(() => {
      emissions.bursts.set(
        [
          ...emissions.bursts.get(),
          { time: 0, count: new PSValue('', emissions, { value: [1, 1] }), cycles: 0, probability: 1 }
        ],
        true,
      )
    })
  }

  const handleDeleteClick = () => {
    runInAction(() => {
      if (activeRow !== undefined) {
        emissions.bursts.set(
          [
            ...emissions.bursts.get().slice(0, activeRow),
            ...emissions.bursts.get().slice(activeRow + 1),
          ],
          true,
        )  
      }
    })
  }

  const handleTimeChange = (index: number, value: number) => {
    runInAction(() => {
      emissions.bursts.set(
        [
          ...emissions.bursts.get().slice(0, index),
          { ...emissions.bursts.get()[index], time: value },
          ...emissions.bursts.get().slice(index + 1),
        ],
        true,
      )
    })
  }

  const [activeRow, setActiveRow] = React.useState<number>()

  const handleRowFocus = (index: number) => {
    setActiveRow(index)
  }

  return (
    <div>
      <Property label="Rate over time" property={emissions.rate}>
        <NumberInput value={emissions.rate.get()} onChange={handleRateChange} />
      </Property>
      <div className={styles.bursts}>
        Bursts:
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
                <div><PSValueInput value={burst.count} onFocus={() => handleRowFocus(index)} /></div>
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
