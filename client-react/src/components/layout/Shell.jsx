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
    <header className="sticky top-0 z-30 w-full backdrop-blur gradient-bg text-white">
      <div className="container-px py-3">
        <div className="flex h-12 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button aria-label="Toggle menu" variant="subtle" size="icon" className="text-white/90 hover:text-white bg-white/10 lg:hidden" onClick={onMenu}>
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
            
            <Button 
              variant="subtle" 
              size="icon" 
              className="text-white/90 hover:text-white bg-white/10"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
            {user && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-md bg-white/10">
                <User className="h-4 w-4" />
                <span className="text-sm">{user.name || user.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth()
  const role = user?.role || 'patient'

  // Define all navigation items with their allowed roles
  const allNavItems = [
    { to: '/dashboard', label: 'Dashboard', roles: ['patient'] },
    { to: '/staff', label: 'Staff Dashboard', roles: ['doctor', 'admin'] },
    { to: '/patients', label: 'Patients', roles: ['doctor', 'admin'] },
    { to: '/analytics', label: 'Analytics', roles: ['doctor', 'admin'] },
    { to: '/alerts', label: 'Alerts', roles: ['patient', 'doctor', 'admin'] },
    { to: '/profile', label: 'Profile', roles: ['patient', 'doctor', 'admin'] },
    { to: '/admin', label: 'Admin Panel', roles: ['admin'] },
  ]

  // Filter navigation items based on user role
  const navItems = allNavItems.filter(item => item.roles.includes(role))

  return (
    <>
      <aside aria-label="Sidebar navigation" className={cn('fixed lg:top-18 inset-y-0 left-0 z-40 w-64 transform transition lg:translate-x-0 bg-white/80 dark:bg-slate-950/60 backdrop-blur border-r border-white/20', open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
        <div className="h-16 flex items-center justify-end px-3 lg:hidden">
          <Button aria-label="Close menu" variant="subtle" size="icon" className="bg-white/10" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="p-4 space-y-1 text-sm">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => cn('block px-3 py-2 rounded-md hover:bg-slate-100/80 dark:hover:bg-white/10', isActive && 'bg-slate-100/80 dark:bg-white/10 font-medium')}>
              {item.label}
            </NavLink>
          ))}
        </nav>
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
