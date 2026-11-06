import { lazy } from 'react'

// The graph library is heavy: load the simulator and admin views on demand.
export const SimulatorPage = lazy(() => import('@/features/whatif').then((m) => ({ default: m.SimulatorPage })))
export const ScenariosPage = lazy(() => import('@/features/whatif').then((m) => ({ default: m.ScenariosPage })))
export const ScenarioDetailPage = lazy(() =>
  import('@/features/whatif').then((m) => ({ default: m.ScenarioDetailPage })),
)
export const AdminCurriculumPage = lazy(() =>
  import('@/features/admin').then((m) => ({ default: m.AdminCurriculumPage })),
)
