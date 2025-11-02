import React from 'react'
import { Menu, Bell, User, Activity } from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

const Topbar = ({ onMenu }) => {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur gradient-bg text-white">
      <div className="container-px py-3">
        <div className="flex h-12 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="subtle" size="icon" className="text-white/90 hover:text-white bg-white/10" onClick={onMenu}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/20 grid place-items-center">
                <Activity className="h-4 w-4" />
              </div>
              <span className="font-semibold">NeuroShield</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="subtle" size="icon" className="text-white/90 hover:text-white bg-white/10">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="subtle" size="icon" className="text-white/90 hover:text-white bg-white/10">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

const Sidebar = ({ open }) => {
  return (
    <aside className={cn('fixed inset-y-0 left-0 z-20 w-72 transform transition lg:translate-x-0 bg-white/80 dark:bg-slate-950/60 backdrop-blur border-r border-white/20', open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
      <div className="h-16" />
      <nav className="p-4 space-y-1 text-sm">
        <a className="block px-3 py-2 rounded-md hover:bg-slate-100/80 dark:hover:bg-white/10" href="/dashboard">Dashboard</a>
        <a className="block px-3 py-2 rounded-md hover:bg-slate-100/80 dark:hover:bg-white/10" href="/patients">Patients</a>
        <a className="block px-3 py-2 rounded-md hover:bg-slate-100/80 dark:hover:bg-white/10" href="/analytics">Analytics</a>
        <a className="block px-3 py-2 rounded-md hover:bg-slate-100/80 dark:hover:bg-white/10" href="/alerts">Alerts</a>
        <a className="block px-3 py-2 rounded-md hover:bg-slate-100/80 dark:hover:bg-white/10" href="/profile">Profile</a>
      </nav>
    </aside>
  )
}

const Shell = ({ children }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="min-h-screen">
      <Topbar onMenu={() => setOpen((v) => !v)} />
      <Sidebar open={open} />
      <main className="container-px pt-6 lg:pl-80 pb-12">
        {children}
      </main>
    </div>
  )
}

export { Shell }
