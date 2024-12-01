import React from 'react'
import { type HeaderInterface } from '../Scene/Types/Types'
import Property from './Property'
import { ComponentType } from '../Renderer/Types'
import type TreeNode from '../Scene/Types/TreeNode'
import { observer } from 'mobx-react-lite'

type PropsType = {
  header: HeaderInterface
  className?: string,
  node: TreeNode,
}

const Header: React.FC<PropsType> = observer(({
  header,
  className,
  node,
}) => (
  <div className={className}>
    <Property
      label="Name"
      property={header.name}
      node={node}
      componentType={ComponentType.Self}
      propertyPath="name"
    >
      {header.name.get()}
    </Property>
  </div>
))

export default Header
