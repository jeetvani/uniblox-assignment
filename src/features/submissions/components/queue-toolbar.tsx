import { Dialog } from "@base-ui/react/dialog"
import { RotateCcw, SlidersHorizontal, X } from "lucide-react"
import { useState } from "react"

import {
  AppSearchBar,
  AppSelect,
  AppText,
  AppView,
} from "@/components/ui/primary"
import { cn } from "@/lib/utils"

import type {
  EmployerGroup,
  SubmissionCompletenessFilter,
  SubmissionDateFilter,
  SubmissionSort,
} from "../types"
import { QueueExtendedFilters } from "./queue-extended-filters"

const sortOptions: { label: string; value: SubmissionSort }[] = [
  { label: "Highest priority", value: "priority_desc" },
  { label: "Highest coverage", value: "coverage_desc" },
  { label: "Lowest coverage", value: "coverage_asc" },
  { label: "Newest submitted", value: "submitted_desc" },
  { label: "Oldest submitted", value: "submitted_asc" },
  { label: "Applicant A–Z", value: "applicant_asc" },
]

function formatFilterLabel(value: string) {
  return value
    .toLocaleLowerCase("en-US")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

type QueueToolbarProps = {
  searchInput: string
  group: string
  reason: string
  sort: SubmissionSort
  groups: EmployerGroup[]
  reasons: string[]
  products: string[]
  priorities: string[]
  product: string
  priority: string
  submitted: SubmissionDateFilter
  completeness: SubmissionCompletenessFilter
  coverageMinDollars: number
  coverageMaxDollars: number | null
  coverageRangeMaximum: number
  extendedFilterCount: number
  isSearching: boolean
  hasActiveFilters: boolean
  hasActiveExtendedFilters: boolean
  onSearchChange: (value: string) => void
  onGroupChange: (value: string) => void
  onReasonChange: (value: string) => void
  onProductChange: (value: string) => void
  onPriorityChange: (value: string) => void
  onSubmittedChange: (value: SubmissionDateFilter) => void
  onCompletenessChange: (value: SubmissionCompletenessFilter) => void
  onCoverageRangeChange: (minimum: number, maximum: number | null) => void
  onSortChange: (value: SubmissionSort) => void
  onResetExtendedFilters: () => void
  onReset: () => void
}

export function QueueToolbar({
  searchInput,
  group,
  reason,
  sort,
  groups,
  reasons,
  products,
  priorities,
  product,
  priority,
  submitted,
  completeness,
  coverageMinDollars,
  coverageMaxDollars,
  coverageRangeMaximum,
  extendedFilterCount,
  isSearching,
  hasActiveFilters,
  hasActiveExtendedFilters,
  onSearchChange,
  onGroupChange,
  onReasonChange,
  onProductChange,
  onPriorityChange,
  onSubmittedChange,
  onCompletenessChange,
  onCoverageRangeChange,
  onSortChange,
  onResetExtendedFilters,
  onReset,
}: QueueToolbarProps) {
  const [isExtendedOpen, setIsExtendedOpen] = useState(false)
  const mobileFilterCount =
    extendedFilterCount + Number(Boolean(group)) + Number(Boolean(reason))
  const groupOptions = [
    { label: "All employer groups", value: "" },
    ...groups.map((item) => ({
      label: item.name ?? "Unnamed group",
      value: item.id ?? "",
    })),
  ]
  const reasonOptions = [
    { label: "All review reasons", value: "" },
    ...reasons.map((item) => ({
      label: formatFilterLabel(item),
      value: item,
    })),
  ]

  return (
    <Dialog.Root onOpenChange={setIsExtendedOpen} open={isExtendedOpen}>
      <AppView className="p-2.5 sm:p-3 xl:p-4" surface="panel">
        <div className="grid gap-2.5 md:grid-cols-[minmax(260px,1.25fr)_minmax(280px,1fr)] xl:hidden">
          <AppSearchBar
            isSearching={isSearching}
            onValueChange={onSearchChange}
            value={searchInput}
          />

          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-2.5">
            <Dialog.Trigger
              className={cn(
                "relative inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-full border px-3 text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none",
                isExtendedOpen || mobileFilterCount > 0
                  ? "border-[#397267]/35 bg-emerald-50 text-[#245f55] shadow-sm"
                  : "border-input bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              <SlidersHorizontal
                aria-hidden="true"
                className="size-4 shrink-0"
              />
              <span className="truncate">Filters</span>
              {mobileFilterCount > 0 ? (
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#397267] text-[10px] font-bold text-white tabular-nums">
                  {mobileFilterCount}
                </span>
              ) : null}
            </Dialog.Trigger>

            <AppSelect<SubmissionSort>
              label="Sort submissions"
              onValueChange={onSortChange}
              options={sortOptions}
              value={sort}
            />
          </div>
        </div>

        <div className="hidden gap-3 xl:grid xl:grid-cols-[minmax(260px,1.4fr)_minmax(165px,0.8fr)_minmax(165px,0.8fr)_minmax(160px,0.7fr)_auto_auto]">
          <AppSearchBar
            isSearching={isSearching}
            onValueChange={onSearchChange}
            value={searchInput}
          />

          <AppSelect
            label="Employer group"
            onValueChange={onGroupChange}
            options={groupOptions}
            value={group}
          />

          <AppSelect
            label="Review reason"
            onValueChange={onReasonChange}
            options={reasonOptions}
            value={reason}
          />

          <AppSelect<SubmissionSort>
            label="Sort submissions"
            onValueChange={onSortChange}
            options={sortOptions}
            value={sort}
          />

          <Dialog.Trigger
            aria-label="Extended filters"
            className={cn(
              "relative inline-flex h-11 items-center justify-center gap-2 rounded-full border px-3 text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none",
              isExtendedOpen || hasActiveExtendedFilters
                ? "border-[#397267]/35 bg-emerald-50 text-[#245f55] shadow-sm"
                : "border-input bg-white text-slate-600 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 hover:shadow-sm",
            )}
          >
            <SlidersHorizontal aria-hidden="true" className="size-4" />
            <span className="hidden xl:inline">Filters</span>
            {extendedFilterCount > 0 ? (
              <span className="grid size-5 place-items-center rounded-full bg-[#397267] text-[10px] font-bold text-white tabular-nums">
                {extendedFilterCount}
              </span>
            ) : null}
          </Dialog.Trigger>

          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-transparent px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40"
            disabled={!hasActiveFilters}
            onClick={onReset}
            type="button"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Reset
          </button>
        </div>
      </AppView>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 min-h-dvh bg-slate-950/25 backdrop-blur-[2px] transition-opacity duration-250 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute motion-reduce:transition-none" />
        <Dialog.Popup className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-[2rem] border border-b-0 border-slate-900/10 bg-[#f8f9f7] text-foreground shadow-[0_32px_100px_rgb(15_23_42/0.24)] outline-none transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-ending-style:translate-y-full data-ending-style:opacity-0 data-starting-style:translate-y-full data-starting-style:opacity-0 xl:inset-x-auto xl:top-1/2 xl:bottom-auto xl:left-1/2 xl:max-h-[min(760px,calc(100dvh-2rem))] xl:w-[min(720px,calc(100vw-2rem))] xl:-translate-x-1/2 xl:-translate-y-1/2 xl:rounded-3xl xl:border-b xl:data-ending-style:-translate-y-1/2 xl:data-starting-style:-translate-y-1/2 motion-reduce:transition-none">
          <div
            aria-hidden="true"
            className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-slate-300 xl:hidden"
          />
          <header className="relative shrink-0 border-b border-slate-900/8 px-5 pt-3 pb-4 pr-16 xl:bg-white xl:px-6 xl:py-5 xl:pr-20">
            <Dialog.Title className="text-lg font-semibold tracking-[-0.02em] text-slate-950 sm:text-xl">
              Extended filters
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm leading-5 text-slate-600">
              Refine coverage and submission quality without moving away from
              the queue.
            </Dialog.Description>
            <Dialog.Close
              aria-label="Close extended filters"
              className="absolute top-3 right-4 grid size-10 place-items-center rounded-full border border-slate-900/10 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring xl:top-5 xl:right-6 xl:size-9"
            >
              <X aria-hidden="true" className="size-4" />
            </Dialog.Close>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 xl:px-6 xl:py-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <AppText variant="eyebrow">Queue refinement</AppText>
              <AppText className="tabular-nums" tone="brand" variant="caption">
                {extendedFilterCount === 0
                  ? "No filters applied"
                  : `${extendedFilterCount} ${extendedFilterCount === 1 ? "filter" : "filters"} applied`}
              </AppText>
            </div>

            <div className="mb-4 grid gap-3 rounded-2xl border border-slate-900/8 bg-white p-4 sm:grid-cols-2 xl:hidden">
              <div className="sm:col-span-2">
                <AppText as="h3" variant="sectionTitle">
                  Essential filters
                </AppText>
                <AppText className="mt-1" tone="muted" variant="caption">
                  Narrow the queue by employer or why it needs review.
                </AppText>
              </div>
              <AppSelect
                label="Employer group"
                onValueChange={onGroupChange}
                options={groupOptions}
                value={group}
              />
              <AppSelect
                label="Review reason"
                onValueChange={onReasonChange}
                options={reasonOptions}
                value={reason}
              />
            </div>

            <QueueExtendedFilters
              completeness={completeness}
              coverageMaxDollars={coverageMaxDollars}
              coverageMinDollars={coverageMinDollars}
              coverageRangeMaximum={coverageRangeMaximum}
              hasActiveFilters={hasActiveExtendedFilters}
              onCompletenessChange={onCompletenessChange}
              onCoverageRangeChange={onCoverageRangeChange}
              onPriorityChange={onPriorityChange}
              onProductChange={onProductChange}
              onReset={onResetExtendedFilters}
              onSubmittedChange={onSubmittedChange}
              priorities={priorities}
              priority={priority}
              product={product}
              products={products}
              submitted={submitted}
            />
          </div>

          <footer className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)] gap-3 border-t border-slate-900/10 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] xl:hidden">
            <button
              className="h-11 rounded-full px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40"
              disabled={!hasActiveFilters}
              onClick={onReset}
              type="button"
            >
              Reset all
            </button>
            <Dialog.Close className="h-11 rounded-full bg-[#245f55] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1c4e46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245f55]">
              View results
            </Dialog.Close>
          </footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
