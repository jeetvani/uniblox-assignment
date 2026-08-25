import { create } from "zustand"

import type {
  SubmissionCompletenessFilter,
  SubmissionDateFilter,
  SubmissionFilters,
  SubmissionSort,
} from "./types"

const DEFAULT_SORT: SubmissionSort = "priority_desc"

type QueueState = {
  searchInput: string
  query: string
  group: string
  reason: string
  product: string
  priority: string
  submitted: SubmissionDateFilter
  completeness: SubmissionCompletenessFilter
  coverageMinDollars: number
  coverageMaxDollars: number | null
  sort: SubmissionSort
  page: number
  pageSize: number
  selectedSubmissionId: string | null
  setSearchInput: (value: string) => void
  commitSearch: (value: string) => void
  setGroup: (value: string) => void
  setReason: (value: string) => void
  setProduct: (value: string) => void
  setPriority: (value: string) => void
  setSubmitted: (value: SubmissionDateFilter) => void
  setCompleteness: (value: SubmissionCompletenessFilter) => void
  setCoverageRange: (minimum: number, maximum: number | null) => void
  setSort: (value: SubmissionSort) => void
  setPage: (value: number) => void
  selectSubmission: (id: string) => void
  closeSubmission: () => void
  resetExtendedFilters: () => void
  resetFilters: () => void
}

export const useQueueStore = create<QueueState>((set) => ({
  searchInput: "",
  query: "",
  group: "",
  reason: "",
  product: "",
  priority: "",
  submitted: "",
  completeness: "",
  coverageMinDollars: 0,
  coverageMaxDollars: null,
  sort: DEFAULT_SORT,
  page: 1,
  pageSize: 10,
  selectedSubmissionId: null,
  setSearchInput: (searchInput) => set({ searchInput }),
  commitSearch: (query) => set({ query: query.trim(), page: 1 }),
  setGroup: (group) => set({ group, page: 1 }),
  setReason: (reason) => set({ reason, page: 1 }),
  setProduct: (product) => set({ product, page: 1 }),
  setPriority: (priority) => set({ priority, page: 1 }),
  setSubmitted: (submitted) => set({ submitted, page: 1 }),
  setCompleteness: (completeness) => set({ completeness, page: 1 }),
  setCoverageRange: (coverageMinDollars, coverageMaxDollars) =>
    set({ coverageMinDollars, coverageMaxDollars, page: 1 }),
  setSort: (sort) => set({ sort, page: 1 }),
  setPage: (page) => set({ page }),
  selectSubmission: (selectedSubmissionId) => set({ selectedSubmissionId }),
  closeSubmission: () => set({ selectedSubmissionId: null }),
  resetExtendedFilters: () =>
    set({
      product: "",
      priority: "",
      submitted: "",
      completeness: "",
      coverageMinDollars: 0,
      coverageMaxDollars: null,
      page: 1,
    }),
  resetFilters: () =>
    set({
      searchInput: "",
      query: "",
      group: "",
      reason: "",
      product: "",
      priority: "",
      submitted: "",
      completeness: "",
      coverageMinDollars: 0,
      coverageMaxDollars: null,
      sort: DEFAULT_SORT,
      page: 1,
    }),
}))

export function getQueueFilters(state: QueueState): SubmissionFilters {
  return {
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
  }
}
