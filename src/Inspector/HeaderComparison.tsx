import React from 'react';
import styles from './ComponentComparison.module.scss';
import { type SceneObjectInterface } from '../Scene/Types/Types';
import Header from './Header';
import type SceneNode from '../Scene/Types/SceneNode';
import { observer } from 'mobx-react-lite';
import OverrideApplyButton from './OverrideApplyButton';
import { ComponentType } from '../Renderer/Types';

type PropsType = {
  sceneNode: SceneNode,
  baseObject: SceneObjectInterface,
  object: SceneObjectInterface,
}

const HeaderComparison: React.FC<PropsType> = observer(({
  sceneNode,
  baseObject,
  object,
}) => (
  <div className={styles.compare}>
    <OverrideApplyButton sceneNode={sceneNode} componentType={ComponentType.Self} />
    <Header className={styles.component} header={baseObject} sceneNode={sceneNode} />
    <Header className={styles.component} header={object} sceneNode={sceneNode} />
  </div>
))

export default HeaderComparison;
