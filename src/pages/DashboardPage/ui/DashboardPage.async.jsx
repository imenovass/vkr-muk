// pages/DashboardPage/ui/DashboardPage.async.jsx
import { lazy } from 'react'

// Важно: указываем путь к файлу с реализацией
export const DashboardPageAsync = lazy(() =>
  import('./DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
