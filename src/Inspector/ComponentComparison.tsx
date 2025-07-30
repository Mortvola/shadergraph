import React from 'react';
import Component from './Component';
import styles from './ComponentComparison.module.scss';
import { type ComponentType, type SceneObjectComponent } from '../Renderer/Types';
import OverrideApplyButton from './OverrideApplyButton';
import type SceneNode from '../Scene/Types/SceneNode';

type PropsType = {
  sceneNode: SceneNode,
  componentType: ComponentType,
  baseComponent: SceneObjectComponent,
  component: SceneObjectComponent,
}

const ComponentComparison: React.FC<PropsType> = ({
  sceneNode,
  componentType,
  baseComponent,
  component,
}) => (
  <div className={styles.compare}>
    <OverrideApplyButton sceneNode={sceneNode} componentType={componentType} />
    <Component
      className={styles.component}
      componentType={componentType}
      component={baseComponent}
      sceneNode={sceneNode}
    />
    <Component className={styles.component} componentType={componentType} component={component} sceneNode={sceneNode} />
  </div>
)

export default ComponentComparison;
