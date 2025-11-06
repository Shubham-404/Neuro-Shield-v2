import React from 'react'
import { cn } from '../../lib/utils'

const Table = ({ className, ...props }) => (
  <div className={cn('overflow-x-auto', className)} {...props} />
)
const T = ({ className, ...props }) => (
  <table className={cn('w-full text-left text-sm', className)} {...props} />
)
const Th = ({ className, ...props }) => (
  <th className={cn('px-4 py-3 font-medium text-slate-600 dark:text-slate-300', className)} {...props} />
)
const Td = ({ className, ...props }) => (
  <td className={cn('px-4 py-3 border-t border-slate-100 dark:border-slate-800', className)} {...props} />
)

export { Table, T, Th, Td }