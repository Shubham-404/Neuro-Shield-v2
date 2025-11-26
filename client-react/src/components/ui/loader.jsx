import React from 'react'
import { cn } from '../../lib/utils'

export const Loader = ({ className, label = 'Loading...' }) => (
  <div className={cn('inline-flex items-center gap-2 text-slate-600 dark:text-slate-400', className)}>
    <svg className="animate-spin h-7 w-7 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
    <span className="text-md">{label}</span>
  </div>
)

export const PageLoader = ({ show }) => (
  <div className={cn('fixed w-min min-w-20 h-min rounded-full px-15 py-9 left-1/2 top-1/2 -translate-1/2 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg', show ? 'block' : 'hidden')}>
    <Loader className='absolute left-1/2 top-1/2 -translate-1/2' label="Please wait..." />
  </div>
)
