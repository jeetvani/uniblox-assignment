import { LoaderCircle, Search, X } from "lucide-react"
import type { ChangeEvent, ComponentPropsWithoutRef } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type AppSearchBarProps = Omit<
  ComponentPropsWithoutRef<typeof Input>,
  "onChange" | "type" | "value"
> & {
  value: string
  onValueChange: (value: string) => void
  label?: string
  isSearching?: boolean
}

export function AppSearchBar({
  value,
  onValueChange,
  label = "Search submissions",
  isSearching = false,
  className,
  placeholder = "Search by applicant name or email",
  ...props
}: AppSearchBarProps) {
  return (
    <div className={cn("relative block w-full", className)} role="search">
      <span className="sr-only">{label}</span>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500"
      />
      <Input
        aria-label={label}
        className="h-11 rounded-full bg-white pr-11 pl-10 shadow-[0_1px_2px_rgb(15_23_42/0.04)]"
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onValueChange(event.target.value)
        }
        placeholder={placeholder}
        type="search"
        value={value}
        {...props}
      />
      <span className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center">
        {isSearching ? (
          <LoaderCircle
            aria-label="Searching"
            className="size-4 animate-spin text-slate-500"
          />
        ) : value ? (
          <button
            aria-label="Clear search"
            className="grid size-7 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
            onClick={() => onValueChange("")}
            type="button"
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>
        ) : null}
      </span>
    </div>
  )
}
