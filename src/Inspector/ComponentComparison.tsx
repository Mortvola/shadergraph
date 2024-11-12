import React from 'react';
import Component from './Component';
import styles from './ComponentComparison.module.scss';
import { type SceneObjectComponent } from '../Renderer/Types';
import { Button } from 'react-bootstrap';

type PropsType = {
  baseComponent: SceneObjectComponent,
  component: SceneObjectComponent,
}

const ComponentComparison: React.FC<PropsType> = ({
  baseComponent,
  component,
}) => (
  <div className={styles.compare}>
    <div>
      <Button>Apply</Button>
    </div>
    <Component className={styles.component} component={baseComponent}/>
    <Component className={styles.component} component={component}/>
  </div>
)

export default ComponentComparison;
