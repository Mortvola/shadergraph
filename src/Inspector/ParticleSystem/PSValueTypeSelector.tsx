import React from 'react';
import { PSValueType } from '../../Renderer/ParticleSystem/Types';
import { observer } from 'mobx-react-lite';
import Dropdown from 'react-bootstrap/Dropdown';
import styles from './Particle.module.scss';
import { CheckIcon } from 'lucide-react';

type PropsType = {
  value: PSValueType
  onChange: (value: PSValueType) => void,
}

const PSValueTypeSelector: React.FC<PropsType> = observer(({
  value,
  onChange,
}) => {
  const handleSelect = (value: string | null) => {
    if (value !== null) {
      onChange(value as PSValueType)
    }
  }

  const renderItem = (currentValue: PSValueType, eventKey: PSValueType, label: string) => {
    return (
      <Dropdown.Item eventKey={eventKey}>
        {
          currentValue === eventKey
            ? <CheckIcon size={16} />
            : <div style={{ width: '16px', display: 'inline-block' }} />
        }
        { label }
      </Dropdown.Item>
    )
  }

  return (
    <Dropdown className={styles.options} onSelect={handleSelect}>
      <Dropdown.Toggle variant="success" id="dropdown-basic" />

      <Dropdown.Menu>
        {
          renderItem(value, PSValueType.Constant, 'Constant')
        }
        {
          renderItem(value, PSValueType.Random, 'Random between two constants')
        }
        {
          renderItem(value, PSValueType.Curve, 'Curve')
        }
        {
          renderItem(value, PSValueType.RandomeCurve, 'Random between two curves')
        }
      </Dropdown.Menu>
    </Dropdown>
  )
})

export default PSValueTypeSelector;
