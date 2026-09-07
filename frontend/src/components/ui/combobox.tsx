"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type ComboboxOption = {
  label: string
  value: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  id?: string
  className?: string
  disabled?: boolean
  // Server-side search mode: when provided, `options` is treated as
  // whatever the last search returned (not the full list) — cmdk's own
  // client-side filtering is disabled and this fires instead, debounced,
  // once when the popover opens (with an empty query) and again on every
  // keystroke. Use this for lists that can grow past what's practical to
  // fetch in one page (e.g. Clients, Subcontractors); leave it unset for
  // the normal fully-loaded, filter-in-the-browser behavior.
  onSearchChange?: (query: string) => void
  loading?: boolean
  // Label to fall back to when `value` isn't present in the current
  // `options` — in server-search mode `options` is a moving window, so the
  // previously-selected item can scroll out of it without being deselected.
  selectedLabel?: string
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No item found.",
  id,
  className,
  disabled,
  onSearchChange,
  loading,
  selectedLabel,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const selected = options.find((option) => option.value === value)
  const triggerLabel = selected?.label ?? (value ? selectedLabel : undefined)

  React.useEffect(() => {
    if (!onSearchChange || !open) return
    // Fire immediately when the popover opens (empty query = default page),
    // debounce subsequent keystrokes.
    const handle = setTimeout(() => onSearchChange(query), query ? 300 : 0)
    return () => clearTimeout(handle)
  }, [query, open, onSearchChange])

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery("")
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", !triggerLabel && "text-muted-foreground", className)}
        >
          {triggerLabel ?? placeholder}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={!onSearchChange}>
          <CommandInput
            placeholder={searchPlaceholder}
            {...(onSearchChange ? { value: query, onValueChange: setQuery } : {})}
          />
          <CommandList>
            <CommandEmpty>{loading ? "Searching..." : emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value === value ? "" : option.value)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", option.value === value ? "opacity-100" : "opacity-0")} />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
