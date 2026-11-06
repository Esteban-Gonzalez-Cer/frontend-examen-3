import { Suspense } from 'react'
import { Outlet } from 'react-router'

import { useSessionWatcher } from '@/features/auth'
import { Spinner } from '@/shared/ui'
import { TopNav } from './TopNav'

export function AppShell() {
  useSessionWatcher()
  return (
    <div className="app-surface min-h-dvh">
      <div className="mx-auto max-w-[1480px]">
        <TopNav />
        <main className="px-4 pt-4 pb-12 sm:px-8 lg:px-10">
          <Suspense fallback={<Spinner className="mt-10" label="Cargando vista…" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
