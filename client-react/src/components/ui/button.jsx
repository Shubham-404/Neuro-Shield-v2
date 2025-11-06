import React from 'react'
import { cn } from '../../lib/utils'

const Button = React.forwardRef(({ className, variant = 'default', size = 'md', disabled, asChild, ...props }, ref) => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-ring disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-500/10',
    ghost: 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60',
    secondary: 'bg-violet-600 text-white hover:bg-violet-700',
    destructive: 'bg-rose-600 text-white hover:bg-rose-700',
    subtle: 'bg-white/70 dark:bg-white/5 border border-white/10 hover:bg-white/90 dark:hover:bg-white/10',
  }
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
    icon: 'h-10 w-10',
  }
  return (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} disabled={disabled} {...props} />
  )
})
Button.displayName = 'Button'
export { Button }
