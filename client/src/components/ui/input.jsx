import React from 'react'
import { cn } from '../../lib/utils'

const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      'flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-white/5 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none',
      className
    )}
    {...props}
  />
))
Input.displayName = 'Input'

const Label = ({ className, ...props }) => (
  <label className={cn('text-sm font-medium text-slate-700 dark:text-slate-300', className)} {...props} />
)

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn('flex w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-white/5 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none', className)}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export { Input, Label, Textarea }
