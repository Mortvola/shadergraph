import React from 'react';
import { Dropdown } from 'react-bootstrap';
import type SceneNode from '../Scene/Types/SceneNode';
import { type ComponentType } from '../Renderer/Types';

type PropsType = {
  node: SceneNode,
  componentType: ComponentType,
}

const OverrideApplyButton: React.FC<PropsType> = ({
  node,
  componentType,
}) => {
  const targets = () => {
    const targets = node.scene.getApplyTargets(node, componentType)

    return targets.map((target) => (
      <Dropdown.Item key={target.label} onClick={target.action}>
        {target.label}
      </Dropdown.Item>
    ))
  }

  return (
    <Dropdown>
      <Dropdown.Toggle>
        Apply
      </Dropdown.Toggle>

      <Dropdown.Menu>
        { targets() }
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default OverrideApplyButton;
