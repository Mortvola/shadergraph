import React from 'react';
import Component from './Component';
import styles from './ComponentComparison.module.scss';
import { type SceneObjectComponent } from '../Renderer/Types';
import OverrideApplyButton from './OverrideApplyButton';
import type TreeNode from '../Scene/Types/TreeNode';
import { type SceneObjectInterface } from '../Scene/Types/Types';

type PropsType = {
  root: TreeNode,
  node: TreeNode,
  baseObject: SceneObjectInterface,
  baseComponent: SceneObjectComponent,
  component: SceneObjectComponent,
}

const ComponentComparison: React.FC<PropsType> = ({
  root,
  node,
  baseObject,
  baseComponent,
  component,
}) => (
  <div className={styles.compare}>
    <OverrideApplyButton root={root} node={node} baseObject={baseObject} key={component.type} />
    <Component className={styles.component} component={baseComponent}/>
    <Component className={styles.component} component={component}/>
  </div>
)

export default ComponentComparison;
