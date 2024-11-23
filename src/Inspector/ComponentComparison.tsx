import React from 'react';
import Component from './Component';
import styles from './ComponentComparison.module.scss';
import { type SceneObjectComponent } from '../Renderer/Types';
import OverrideApplyButton from './OverrideApplyButton';
import type TreeNode from '../Scene/Types/TreeNode';

type PropsType = {
  node: TreeNode,
  baseComponent: SceneObjectComponent,
  component: SceneObjectComponent,
}

const ComponentComparison: React.FC<PropsType> = ({
  node,
  baseComponent,
  component,
}) => (
  <div className={styles.compare}>
    <OverrideApplyButton node={node} componentType={component.type} />
    <Component className={styles.component} component={baseComponent} node={node} />
    <Component className={styles.component} component={component} node={node} />
  </div>
)

export default ComponentComparison;
