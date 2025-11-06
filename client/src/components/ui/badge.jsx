import React from 'react'
import { cn } from '../../lib/utils'

const Badge = ({ className, variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
    gray: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200',
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
    destructive: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', variants[variant], className)} {...props} />
  )
}

export { Badge }
