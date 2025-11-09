import React from 'react'
import { cn } from '../../lib/utils'

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('card p-6', className)} {...props} />
))
Card.displayName = 'Card'

const CardHeader = ({ className, ...props }) => (
  <div className={cn('mb-4', className)} {...props} />
)
const CardTitle = ({ className, ...props }) => (
  <h3 className={cn('text-lg font-semibold tracking-tight', className)} {...props} />
)
const CardDescription = ({ className, ...props }) => (
  <p className={cn('text-sm text-slate-500 dark:text-slate-400 backdrop-blur-lg', className)} {...props} />
)
const CardContent = ({ className, ...props }) => (
  <div className={cn('space-y-4', className)} {...props} />
)

export { Card, CardHeader, CardTitle, CardDescription, CardContent }