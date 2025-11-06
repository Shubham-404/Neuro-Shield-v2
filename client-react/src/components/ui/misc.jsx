import React from 'react'
import { cn } from '../../lib/utils'

const Separator = ({ className }) => (
  <div className={cn('h-px w-full bg-slate-200 dark:bg-slate-800', className)} />
)

const Progress = ({ value = 0, className }) => (
  <div className={cn('w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden', className)}>
    <div className="h-full bg-blue-600" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
  </div>
)

const Skeleton = ({ className }) => (
  <div className={cn('animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-800/60', className)} />
)

export { Separator, Progress, Skeleton }
