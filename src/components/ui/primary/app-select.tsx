import { Select } from "@base-ui/react/select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"

export type AppSelectOption<Value extends string = string> = {
  value: Value
  label: string
  disabled?: boolean
}

export type AppSelectProps<Value extends string = string> = {
  label: string
  value: Value
  options: readonly AppSelectOption<Value>[]
  onValueChange: (value: Value) => void
  className?: string
  disabled?: boolean
  placeholder?: string
}

export function AppSelect<Value extends string = string>({
  label,
  value,
  options,
  onValueChange,
  className,
  disabled = false,
  placeholder = "Select an option",
}: AppSelectProps<Value>) {
  const [isOpen, setIsOpen] = useState(false)
  const encodeValue = (optionValue: Value) => `app-select:${optionValue}`
  const internalOptions = options.map((option) => ({
    ...option,
    value: encodeValue(option.value),
  }))

  return (
    <Select.Root<string>
      disabled={disabled}
      items={internalOptions}
      onOpenChange={setIsOpen}
      onValueChange={(nextValue) => {
        const selectedOption = options.find(
          (option) => encodeValue(option.value) === nextValue,
        )

        if (selectedOption) {
          onValueChange(selectedOption.value)
        }
      }}
      open={isOpen}
      value={encodeValue(value)}
    >
      <div className={cn("min-w-0", className)}>
        <Select.Label className="sr-only">{label}</Select.Label>
        <Select.Trigger className="group flex h-11 w-full min-w-0 items-center justify-between gap-3 rounded-full border border-input bg-white px-4 text-left text-sm font-medium text-slate-700 shadow-[0_1px_2px_rgb(15_23_42/0.04)] outline-none transition-[border-color,box-shadow,background-color] hover:bg-slate-50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 data-disabled:pointer-events-none data-disabled:opacity-50 data-popup-open:border-ring data-popup-open:ring-3 data-popup-open:ring-ring/15">
          <Select.Value
            className="min-w-0 truncate data-placeholder:text-slate-400"
            placeholder={placeholder}
          />
          <Select.Icon className="shrink-0 text-slate-500">
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "size-4 transition-transform duration-200 ease-out motion-reduce:transition-none",
                isOpen && "rotate-180",
              )}
            />
          </Select.Icon>
        </Select.Trigger>
      </div>

      <Select.Portal>
        <Select.Positioner
          alignItemWithTrigger={false}
          className="z-50 outline-none"
          sideOffset={6}
        >
          <Select.Popup className="w-[min(30rem,calc(100vw-2rem))] min-w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 text-slate-700 shadow-[0_16px_42px_-12px_rgba(15,23,42,0.28)] backdrop-blur-xl transition-[opacity,scale,transform] duration-200 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-[side=bottom]:data-ending-style:-translate-y-1.5 data-[side=bottom]:data-starting-style:-translate-y-1.5 data-[side=top]:data-ending-style:translate-y-1.5 data-[side=top]:data-starting-style:translate-y-1.5 motion-reduce:transition-none">
            <Select.ScrollUpArrow className="flex h-6 w-full items-center justify-center rounded-md bg-white text-slate-400">
              <ChevronUp aria-hidden="true" className="size-3.5" />
            </Select.ScrollUpArrow>

            <Select.List className="w-full max-h-[min(20rem,var(--available-height))] overflow-y-auto scroll-py-1 py-0.5 outline-none">
              {options.map((option) => (
                <Select.Item
                  className="grid min-h-9 w-full cursor-default grid-cols-[1rem_minmax(0,1fr)] items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium outline-none transition-colors data-disabled:opacity-40 data-highlighted:bg-emerald-50 data-highlighted:text-emerald-950 data-selected:text-emerald-800"
                  disabled={option.disabled}
                  key={option.value || option.label}
                  value={encodeValue(option.value)}
                >
                  <Select.ItemIndicator className="col-start-1 text-emerald-600">
                    <Check
                      aria-hidden="true"
                      className="size-4"
                      strokeWidth={2.5}
                    />
                  </Select.ItemIndicator>
                  <Select.ItemText className="col-start-2 min-w-0 whitespace-normal break-words">
                    {option.label}
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>

            <Select.ScrollDownArrow className="flex h-6 w-full items-center justify-center rounded-md bg-white text-slate-400">
              <ChevronDown aria-hidden="true" className="size-3.5" />
            </Select.ScrollDownArrow>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}
