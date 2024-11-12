import React from 'react'
import { type HeaderInterface } from '../Scene/Types/Types'

type PropsType = {
  header: HeaderInterface
  className?: string,
}

const Header: React.FC<PropsType> = ({
  header,
  className,
}) => (
  <div className={className}>
    {`Name: ${header.name.get()}`}
  </div>
)

export default Header
