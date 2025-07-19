import React from 'react';
import styles from './ComponentComparison.module.scss';
import { type SceneObjectInterface } from '../Scene/Types/Types';
import Header from './Header';
import type SceneNode from '../Scene/Types/SceneNode';
import { observer } from 'mobx-react-lite';
import OverrideApplyButton from './OverrideApplyButton';
import { ComponentType } from '../Renderer/Types';

type PropsType = {
  node: SceneNode,
  baseObject: SceneObjectInterface,
  object: SceneObjectInterface,
}

const HeaderComparison: React.FC<PropsType> = observer(({
  node,
  baseObject,
  object,
}) => (
  <div className={styles.compare}>
    <OverrideApplyButton node={node} componentType={ComponentType.Self} />
    <Header className={styles.component} header={baseObject} node={node} />
    <Header className={styles.component} header={object} node={node} />
  </div>
))

export default HeaderComparison;
