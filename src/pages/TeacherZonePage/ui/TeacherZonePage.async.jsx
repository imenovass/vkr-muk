// pages/TeacherZonePage/ui/TeacherZonePage.async.jsx
import { lazy } from 'react'

export const TeacherZonePageAsync = lazy(() =>
  import('./TeacherZonePage').then((module) => ({
    default: module.TeacherZonePage,
  })),
)
