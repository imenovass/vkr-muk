import React from 'react'

import logo from '../../../shared/assests/images/logo.png'

import './Logo.scss'

const Logo = () => {
  return (
    <div className="logo">
      <img src={logo} alt="" className="img" />
    </div>
  )
}

export default Logo
