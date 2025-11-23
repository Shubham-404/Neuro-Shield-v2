import React from 'react'
import { Menu, Bell, User, Activity, X, LogOut } from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Topbar = ({ onMenu }) => {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 lg:hidden">
      <div className="container-px py-3">
        <div className="flex h-12 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button aria-label="Toggle menu" variant="ghost" size="icon" onClick={onMenu}>
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-semibold text-lg">NeuroShield</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth()
  const role = user?.role || 'patient'

  // Define all navigation items with their allowed roles
  const allNavItems = [
    { to: '/patients/dashboard', label: 'Patient Dashboard', roles: ['patient'], icon: Activity },
    { to: '/patients/records', label: 'Medical Records', roles: ['patient'], icon: Activity },
    { to: '/patients/metrics', label: 'Health Metrics', roles: ['patient'], icon: Activity },
    { to: '/patients/logs', label: 'Health Logs', roles: ['patient'], icon: Activity },
    { to: '/patients/my-doctors', label: 'My Doctors', roles: ['patient'], icon: User },
    { to: '/patients/doctors', label: 'Find Doctors', roles: ['patient'], icon: User },

    { to: '/staff', label: 'Staff Dashboard', roles: ['doctor', 'admin'], icon: Activity },
    { to: '/patients', label: 'Patients', roles: ['doctor', 'admin'], icon: User },
    { to: '/doctors/verify-records', label: 'Verify Records', roles: ['doctor', 'admin'], icon: Activity },
    { to: '/analytics', label: 'Analytics', roles: ['doctor', 'admin'], icon: Activity },

    { to: '/alerts', label: 'Alerts', roles: ['patient', 'doctor', 'admin'], icon: Bell },
    { to: '/profile', label: 'Profile', roles: ['patient', 'doctor', 'admin'], icon: User },
    { to: '/admin', label: 'Admin Panel', roles: ['admin'], icon: Activity },
  ]

  // Filter navigation items based on user role
  const navItems = allNavItems.filter(item => item.roles.includes(role))

  return (
    <>
      <aside aria-label="Sidebar navigation" className={cn('fixed lg:top-0 inset-y-0 left-0 z-40 w-64 transform transition lg:translate-x-0 bg-[#0f4c5c] text-white border-r border-white/10', open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-lg bg-white/20 grid place-items-center">
              <Activity className="h-5 w-5" />
            </div>
            <span>NeuroShield</span>
          </div>
          <Button aria-label="Close menu" variant="ghost" size="icon" className="lg:hidden text-white/70 hover:text-white hover:bg-white/10" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-2 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                'hover:bg-white/10 text-white/80 hover:text-white',
                isActive && 'bg-white/20 text-white font-medium shadow-sm'
              )}
            >
              {item.icon && <item.icon className="h-5 w-5" />}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 overflow-hidden">
              <div className="h-8 w-8 rounded-full bg-white/20 grid place-items-center shrink-0">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-white/60 truncate capitalize">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-14 w-12 rounded-xl text-white/70 hover:text-white hover:bg-white/10 shrink-0"
              onClick={() => {
                if (window.confirm('Are you sure you want to logout?')) {
                  logout()
                }
              }}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </aside>
      {/* Scrim for mobile */}
      <button aria-hidden className={cn('fixed inset-0 z-30 bg-black/30 lg:hidden', open ? 'block' : 'hidden')} onClick={onClose} />
    </>
  )
}

const Shell = ({ children }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="min-h-screen">
      <Topbar onMenu={() => setOpen(true)} />
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <main className="container-px lg:ml-60 pt-6 lg:pl-80 pb-12">
        {children}
      </main>
    </div>
  )
}

export { Shell }
