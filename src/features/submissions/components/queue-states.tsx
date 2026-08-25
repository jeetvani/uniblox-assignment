import { AlertTriangle, Inbox, SearchX } from "lucide-react"

import { AppText, AppView } from "@/components/ui/primary"

export function QueueLoadingState() {
  return (
    <AppView
      aria-busy="true"
      aria-label="Loading enrollment submissions"
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      surface="panel"
    >
      <div className="border-b border-border px-5 py-4">
        <div className="h-4 w-44 animate-pulse rounded-full bg-slate-200" />
      </div>
      <div className="grid min-h-0 flex-1 gap-2 overflow-hidden p-2 sm:p-3 md:grid-cols-2 xl:hidden">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            className="min-h-48 rounded-2xl border border-slate-900/6 bg-white p-4"
            key={index}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-2/3 space-y-2">
                <div className="h-4 animate-pulse rounded-full bg-slate-200" />
                <div className="h-3 w-4/5 animate-pulse rounded-full bg-slate-100" />
              </div>
              <div className="h-6 w-14 animate-pulse rounded-full bg-slate-100" />
            </div>
            <div className="my-4 h-px bg-slate-100" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }, (_, field) => (
                <div className="space-y-2" key={field}>
                  <div className="h-2.5 w-14 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-3.5 animate-pulse rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="hidden divide-y divide-border xl:block">
        {Array.from({ length: 7 }, (_, index) => (
          <div
            className="grid grid-cols-[1.4fr_1.2fr_1fr_0.7fr] gap-8 px-5 py-5"
            key={index}
          >
            <div className="h-4 animate-pulse rounded-full bg-slate-200" />
            <div className="h-4 animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 animate-pulse rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    </AppView>
  )
}

type QueueErrorStateProps = {
  message: string
  onRetry: () => void
}

export function QueueErrorState({ message, onRetry }: QueueErrorStateProps) {
  return (
    <AppView
      className="grid min-h-0 flex-1 place-items-center px-5 py-8 text-center sm:px-6 sm:py-12"
      role="alert"
      surface="panel"
    >
      <div className="max-w-md">
        <div className="mx-auto mb-4 grid size-11 place-items-center rounded-full bg-red-50 text-red-700">
          <AlertTriangle aria-hidden="true" className="size-5" />
        </div>
        <AppText as="h2" variant="sectionTitle">
          The review queue could not be loaded
        </AppText>
        <AppText className="mt-2" tone="muted" variant="body">
          {message}
        </AppText>
        <button
          className="mt-5 h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          onClick={onRetry}
          type="button"
        >
          Try again
        </button>
      </div>
    </AppView>
  )
}

type QueueEmptyStateProps = {
  hasActiveFilters: boolean
  onReset: () => void
}

export function QueueEmptyState({
  hasActiveFilters,
  onReset,
}: QueueEmptyStateProps) {
  const Icon = hasActiveFilters ? SearchX : Inbox

  return (
    <AppView
      className="grid min-h-0 flex-1 place-items-center px-5 py-8 text-center sm:px-6 sm:py-12"
      surface="panel"
    >
      <div className="max-w-md">
        <div className="mx-auto mb-4 grid size-11 place-items-center rounded-full bg-slate-100 text-slate-600">
          <Icon aria-hidden="true" className="size-5" />
        </div>
        <AppText as="h2" variant="sectionTitle">
          {hasActiveFilters ? "No matching submissions" : "The queue is clear"}
        </AppText>
        <AppText className="mt-2" tone="muted" variant="body">
          {hasActiveFilters
            ? "Try changing your search or removing one of the active filters."
            : "There are currently no enrollment submissions waiting for review."}
        </AppText>
        {hasActiveFilters ? (
          <button
            className="mt-5 h-10 rounded-lg border border-border bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            onClick={onReset}
            type="button"
          >
            Clear all filters
          </button>
        ) : null}
      </div>
    </AppView>
  )
}
