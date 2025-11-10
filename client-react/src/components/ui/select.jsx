// components/ui/select.jsx
import * as React from "react"
import { ChevronDown } from "lucide-react"

const SelectContext = React.createContext()

const Select = ({ children, value, onValueChange, ...props }) => {
  const [open, setOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || '')

  // Sync with external value prop
  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
    }
  }, [value])

  const handleSelect = (val) => {
    setSelectedValue(val)
    setOpen(false)
    if (onValueChange) onValueChange(val)
  }

  return (
    <SelectContext.Provider value={{ selectedValue, handleSelect, open, setOpen }}>
      <div className="relative" {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef(({ className = '', children, ...props }, ref) => {
  const { selectedValue, open, setOpen } = React.useContext(SelectContext)
  
  return (
    <div
      ref={ref}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 ${className}`}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children || <span className={selectedValue ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}>
        {selectedValue || 'Select...'}
      </span>}
      <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`} />
    </div>
  )
})

const SelectValue = ({ placeholder, ...props }) => {
  const { selectedValue } = React.useContext(SelectContext)
  return (
    <span className={selectedValue ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'} {...props}>
      {selectedValue || placeholder}
    </span>
  )
}

const SelectContent = React.forwardRef(({ children, className = '', ...props }, ref) => {
  const { open, setOpen } = React.useContext(SelectContext)
  const contentRef = React.useRef(null)

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (contentRef.current && !contentRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={contentRef}
      className={`absolute z-50 mt-1 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  )
})

const SelectItem = ({ value, children, className = '', ...props }) => {
  const { selectedValue, handleSelect } = React.useContext(SelectContext)
  const isSelected = selectedValue === value

  return (
    <div
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 ${
        isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : ''
      } ${className}`}
      onClick={() => handleSelect(value)}
      {...props}
    >
      {children}
    </div>
  )
}

SelectTrigger.displayName = "SelectTrigger"
SelectContent.displayName = "SelectContent"
SelectValue.displayName = "SelectValue"
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
