// shared/ui/Loader/Loader.jsx
import React from 'react'

import { Spin } from 'antd'

import './Loader.scss'

// при желании

export const Loader = () => {
  return (
    <div className="loader">
      <Spin size="large" tip="Загрузка..." />
    </div>
  )
}
