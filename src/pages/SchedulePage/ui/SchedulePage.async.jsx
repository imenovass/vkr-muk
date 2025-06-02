import { lazy } from 'react'

export const SchedulePageAsync = lazy(() =>
  import('./SchedulePage').then((module) => ({ default: module.SchedulePage })),
)
