import { createBrowserRouter, Navigate } from 'react-router'

import { LoginPage } from '@/features/auth'
import { GradesPage } from '@/features/grades'
import { KardexPage } from '@/features/kardex'
import { SchedulePage } from '@/features/schedule'
import { DashboardPage } from '@/features/student'
import { AppShell } from '../layout/AppShell'
import { AdminRoute, ProtectedRoute, PublicOnlyRoute } from './guards'
import { AdminCurriculumPage, ScenarioDetailPage, ScenariosPage, SimulatorPage } from './lazyPages'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/calificaciones', element: <GradesPage /> },
          { path: '/kardex', element: <KardexPage /> },
          { path: '/horario', element: <SchedulePage /> },
          { path: '/simulador', element: <SimulatorPage /> },
          { path: '/simulador/escenarios', element: <ScenariosPage /> },
          { path: '/simulador/escenarios/:scenarioId', element: <ScenarioDetailPage /> },
          {
            element: <AdminRoute />,
            children: [{ path: '/admin/reticula', element: <AdminCurriculumPage /> }],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
