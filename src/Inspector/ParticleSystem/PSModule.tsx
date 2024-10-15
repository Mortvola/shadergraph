import { observer } from 'mobx-react-lite';
import React from 'react';
import Checkbox from '../../ShaderEditor/Controls/Checkbox';
import styles from './PSModule.module.scss';
import type PSModuleData from '../../Renderer/Properties/PSModule';
import Property from '../Property';

type PropsType = {
  module: PSModuleData,
  title: string,
  children?: React.ReactNode,
}

const PSModule: React.FC<PropsType> = observer(({
  module,
  title,
  children,
}) => {
  const [open, setOpen] = React.useState<boolean>(false);

  const handleOpenClick = () => {
    setOpen((prev) => !prev)
  }

  const handleEnableChange = (value: boolean) => {
    module.enabled.set(value, true)
  }

  return (
    <div className={styles.layout}>
      <div onClick={handleOpenClick}>
        <Checkbox
          label={<Property label={title} property={module.enabled} />}
          value={module.enabled.get()}
          onChange={handleEnableChange}
        />
      </div>
        {
          open
            ? (
              <div>
                {children}
              </div>      
            )
            : null
        }
    </div>
  )
})

export default PSModule;
