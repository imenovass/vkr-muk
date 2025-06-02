import { lazy } from 'react'

export const CourseDetailPageAsync = lazy(() =>
  import('./CourseDetailPage').then((module) => ({
    default: module.CourseDetailPage,
  })),
)
