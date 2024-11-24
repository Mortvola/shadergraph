import React from 'react';
import Component from './Component';
import styles from './ComponentComparison.module.scss';
import { type ComponentType, type SceneObjectComponent } from '../Renderer/Types';
import OverrideApplyButton from './OverrideApplyButton';
import type TreeNode from '../Scene/Types/TreeNode';

type PropsType = {
  node: TreeNode,
  componentType: ComponentType,
  baseComponent: SceneObjectComponent,
  component: SceneObjectComponent,
}

const ComponentComparison: React.FC<PropsType> = ({
  node,
  componentType,
  baseComponent,
  component,
}) => (
  <div className={styles.compare}>
    <OverrideApplyButton node={node} componentType={componentType} />
    <Component className={styles.component} componentType={componentType} component={baseComponent} node={node} />
    <Component className={styles.component} componentType={componentType} component={component} node={node} />
  </div>
)

export default ComponentComparison;
