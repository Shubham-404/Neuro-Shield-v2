import React from 'react'
import { cn } from '../../lib/utils'

const Tabs = ({ value, onValueChange, children, className }) => (
  <div className={cn('w-full', className)} data-value={value} onChange={onValueChange}>{children}</div>
)
const TabsList = ({ className, children }) => (
  <div className={cn('inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300', className)}>
    {children}
  </div>
)
const TabsTrigger = ({ className, active, ...props }) => (
  <button
    className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition focus-ring data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:ring-offset-slate-900', active ? 'bg-white text-slate-900 shadow-sm' : 'opacity-70 hover:opacity-100', className)}
    {...props}
  />
)
const TabsContent = ({ className, ...props }) => (
  <div className={cn('mt-4', className)} {...props} />
)

export { Tabs, TabsList, TabsTrigger, TabsContent }
