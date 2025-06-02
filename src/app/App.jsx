import React from 'react'
import { HashRouter } from 'react-router-dom'

import { AppRouter } from './providers/AppRouter'

export const App = () => {
  return (
    <HashRouter>
      <AppRouter />
    </HashRouter>
  )
}
