// components/ui/select.tsx
import * as React from "react"
import { ChevronDown } from "lucide-react"

const Select = ({ children, ...props }) => <select {...props}>{children}</select>
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <div className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`} ref={ref} {...props}>
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </div>
))
const SelectValue = ({ placeholder }) => <span className="text-muted-foreground">{placeholder}</span>
const SelectContent = ({ children }) => <div className="mt-1 rounded-md border bg-popover p-1 shadow-md">{children}</div>
const SelectItem = ({ value, children }) => (
  <option value={value} className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent">
    {children}
  </option>
)

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }