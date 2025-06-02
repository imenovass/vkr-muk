// pages/CoursesPage/ui/CoursesPage.async.jsx
import { lazy } from 'react'

export const CoursesPageAsync = lazy(() => import('./CoursesPage').then((module) => ({ default: module.CoursesPage })))
