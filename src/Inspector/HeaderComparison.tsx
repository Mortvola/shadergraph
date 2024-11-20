import React from 'react';
import styles from './ComponentComparison.module.scss';
import { type SceneObjectInterface } from '../Scene/Types/Types';
import Header from './Header';
import type TreeNode from '../Scene/Types/TreeNode';
import { observer } from 'mobx-react-lite';
import OverrideApplyButton from './OverrideApplyButton';

type PropsType = {
  root: TreeNode,
  node: TreeNode,
  baseObject: SceneObjectInterface,
  object: SceneObjectInterface,
}

const HeaderComparison: React.FC<PropsType> = observer(({
  root,
  node,
  baseObject,
  object,
}) => (
  <div className={styles.compare}>
    <OverrideApplyButton root={root} node={node} baseObject={baseObject} key="name" />
    <Header className={styles.component} header={baseObject.header}/>
    <Header className={styles.component} header={object.header}/>
  </div>
))

export default HeaderComparison;
