import { useEffect, useMemo, useState } from "react"
import { useShallow } from "zustand/react/shallow"

import { WorkbenchLayout } from "@/components/ui/workbench-layout"

import { QueuePagination } from "./components/queue-pagination"
import {
  QueueEmptyState,
  QueueErrorState,
  QueueLoadingState,
} from "./components/queue-states"
import { QueueToolbar } from "./components/queue-toolbar"
import { SubmissionDetailsSheet } from "./components/submission-details-sheet"
import { SubmissionsTable } from "./components/submissions-table"
import { useSubmissions } from "./hooks"
import { orderSubmissionsForDisplay } from "./queue-sorting"
import { useQueueStore } from "./queue-store"
import type { EmployerGroup, SubmissionFilters } from "./types"

function buildFilterOptions(items: ReturnType<typeof useSubmissions>["data"]) {
  const groupMap = new Map<string, EmployerGroup>()
  const reasons = new Set<string>()
  const products = new Set<string>()
  const priorities = new Set<string>()
  let coverageRangeMaximum = 1

  for (const submission of items?.items ?? []) {
    if (submission.group?.id) {
      groupMap.set(submission.group.id, submission.group)
    }
    if (submission.reviewReason) reasons.add(submission.reviewReason)
    if (submission.product) products.add(submission.product)
    if (submission.priority) priorities.add(submission.priority)
    if (typeof submission.coverageAmountCents === "number") {
      coverageRangeMaximum = Math.max(
        coverageRangeMaximum,
        Math.ceil(submission.coverageAmountCents / 100),
      )
    }
  }

  const priorityRank: Record<string, number> = {
    URGENT: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  }

  return {
    groups: [...groupMap.values()].sort((left, right) =>
      (left.name ?? "").localeCompare(right.name ?? "", "en-US"),
    ),
    reasons: [...reasons].sort((left, right) => left.localeCompare(right)),
    products: [...products].sort((left, right) => left.localeCompare(right)),
    priorities: [...priorities].sort(
      (left, right) => (priorityRank[right] ?? 0) - (priorityRank[left] ?? 0),
    ),
    coverageRangeMaximum,
  }
}

export function SubmissionQueuePage() {
  const [queueScrollRequest, setQueueScrollRequest] = useState<{
    key: number
    target: "top" | "bottom"
  }>({ key: 0, target: "top" })
  const queue = useQueueStore(
    useShallow((state) => ({
      searchInput: state.searchInput,
      query: state.query,
      group: state.group,
      reason: state.reason,
      product: state.product,
      priority: state.priority,
      submitted: state.submitted,
      completeness: state.completeness,
      coverageMinDollars: state.coverageMinDollars,
      coverageMaxDollars: state.coverageMaxDollars,
      sort: state.sort,
      page: state.page,
      pageSize: state.pageSize,
      selectedSubmissionId: state.selectedSubmissionId,
      setSearchInput: state.setSearchInput,
      commitSearch: state.commitSearch,
      setGroup: state.setGroup,
      setReason: state.setReason,
      setProduct: state.setProduct,
      setPriority: state.setPriority,
      setSubmitted: state.setSubmitted,
      setCompleteness: state.setCompleteness,
      setCoverageRange: state.setCoverageRange,
      setSort: state.setSort,
      setPage: state.setPage,
      selectSubmission: state.selectSubmission,
      closeSubmission: state.closeSubmission,
      resetExtendedFilters: state.resetExtendedFilters,
      resetFilters: state.resetFilters,
    })),
  )
  const { commitSearch, page, searchInput, setPage } = queue

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      commitSearch(searchInput)
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [commitSearch, searchInput])

  const filters: SubmissionFilters = {
    query: queue.query,
    group: queue.group,
    reason: queue.reason,
    product: queue.product,
    priority: queue.priority,
    submitted: queue.submitted,
    completeness: queue.completeness,
    coverageMinDollars: queue.coverageMinDollars,
    coverageMaxDollars: queue.coverageMaxDollars,
    sort: queue.sort,
  }

  const submissionsQuery = useSubmissions(filters)
  const optionsQuery = useSubmissions({ sort: "priority_desc" })
  const options = useMemo(
    () => buildFilterOptions(optionsQuery.data),
    [optionsQuery.data],
  )

  const total = submissionsQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / queue.pageSize))
  const orderedSubmissions = useMemo(
    () =>
      orderSubmissionsForDisplay(
        submissionsQuery.data?.items ?? [],
        queue.sort,
      ),
    [queue.sort, submissionsQuery.data?.items],
  )

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, setPage, totalPages])

  const pageStart = (queue.page - 1) * queue.pageSize
  const visibleSubmissions = orderedSubmissions.slice(
    pageStart,
    pageStart + queue.pageSize,
  )
  const hasActiveFilters = Boolean(
    queue.searchInput ||
    queue.group ||
    queue.reason ||
    queue.product ||
    queue.priority ||
    queue.submitted ||
    queue.completeness ||
    queue.coverageMinDollars > 0 ||
    queue.coverageMaxDollars !== null ||
    queue.sort !== "priority_desc",
  )
  const extendedFilterCount = [
    queue.product,
    queue.priority,
    queue.submitted,
    queue.completeness,
    queue.coverageMinDollars > 0 || queue.coverageMaxDollars !== null,
  ].filter(Boolean).length
  const hasActiveExtendedFilters = extendedFilterCount > 0
  const isSearchSettling = queue.searchInput.trim() !== queue.query

  const toolbar = (
    <QueueToolbar
      group={queue.group}
      groups={options.groups}
      hasActiveFilters={hasActiveFilters}
      hasActiveExtendedFilters={hasActiveExtendedFilters}
      completeness={queue.completeness}
      coverageMaxDollars={queue.coverageMaxDollars}
      coverageMinDollars={queue.coverageMinDollars}
      coverageRangeMaximum={options.coverageRangeMaximum}
      extendedFilterCount={extendedFilterCount}
      isSearching={isSearchSettling || submissionsQuery.isFetching}
      onCompletenessChange={queue.setCompleteness}
      onCoverageRangeChange={queue.setCoverageRange}
      onGroupChange={queue.setGroup}
      onPriorityChange={queue.setPriority}
      onProductChange={queue.setProduct}
      onReasonChange={queue.setReason}
      onReset={queue.resetFilters}
      onResetExtendedFilters={queue.resetExtendedFilters}
      onSearchChange={queue.setSearchInput}
      onSortChange={queue.setSort}
      onSubmittedChange={queue.setSubmitted}
      priorities={options.priorities}
      priority={queue.priority}
      product={queue.product}
      products={options.products}
      reason={queue.reason}
      reasons={options.reasons}
      searchInput={queue.searchInput}
      sort={queue.sort}
      submitted={queue.submitted}
    />
  )

  return (
    <WorkbenchLayout toolbar={toolbar}>
      {submissionsQuery.isPending ? <QueueLoadingState /> : null}

      {submissionsQuery.isError ? (
        <QueueErrorState
          message={submissionsQuery.error.message}
          onRetry={() => void submissionsQuery.refetch()}
        />
      ) : null}

      {submissionsQuery.isSuccess && total === 0 ? (
        <QueueEmptyState
          hasActiveFilters={hasActiveFilters}
          onReset={queue.resetFilters}
        />
      ) : null}

      {submissionsQuery.isSuccess && total > 0 ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <SubmissionsTable
            isUpdating={submissionsQuery.isFetching}
            onSelectSubmission={queue.selectSubmission}
            scrollRequest={queueScrollRequest}
            selectedSubmissionId={queue.selectedSubmissionId}
            submissions={visibleSubmissions}
            total={total}
          />
          <QueuePagination
            onPageChange={(nextPage) => {
              setQueueScrollRequest((current) => ({
                key: current.key + 1,
                target: nextPage > queue.page ? "top" : "bottom",
              }))
              queue.setPage(nextPage)
            }}
            page={queue.page}
            pageSize={queue.pageSize}
            total={total}
          />
        </div>
      ) : null}

      <SubmissionDetailsSheet
        onOpenChange={(open) => {
          if (!open) queue.closeSubmission()
        }}
        submissionId={queue.selectedSubmissionId}
      />
    </WorkbenchLayout>
  )
}
