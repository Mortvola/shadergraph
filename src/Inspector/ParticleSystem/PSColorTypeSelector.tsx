import React from 'react';
import { PSColorType } from '../../Renderer/ParticleSystem/Types';
import { observer } from 'mobx-react-lite';
import Dropdown from 'react-bootstrap/Dropdown';
import styles from './Particle.module.scss';
import { CheckIcon } from 'lucide-react';

type PropsType = {
  value: PSColorType,
  onChange: (value: PSColorType) => void,
}

const PSColorTypeSelector: React.FC<PropsType> = observer(({
  value,
  onChange,
}) => {
  const handleSelect = (value: string | null) => {
    if (value !== null) {
      onChange(value as PSColorType)
    }
  }

  const renderItem = (currentValue: PSColorType, eventKey: PSColorType, label: string) => {
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
        renderItem(value, PSColorType.Constant, 'Constant')
      }
      {
        renderItem(value, PSColorType.Random, 'Random between two colors')
      }
      {
        renderItem(value, PSColorType.Gradient, 'Gradient')
      }
      {
        renderItem(value, PSColorType.RandomGradient, 'Random between two gradients')
      }
    </Dropdown.Menu>
  </Dropdown>
  )
})

export default PSColorTypeSelector;
