import type { SubmissionFilters } from "./types"

export const submissionKeys = {
  all: ["submissions"] as const,
  lists: () => [...submissionKeys.all, "list"] as const,
  list: (filters: SubmissionFilters) =>
    [
      ...submissionKeys.lists(),
      {
        query: filters.query?.trim() ?? "",
        group: filters.group ?? "",
        reason: filters.reason ?? "",
        product: filters.product ?? "",
        priority: filters.priority ?? "",
        submitted: filters.submitted ?? "",
        completeness: filters.completeness ?? "",
        coverageMinDollars: filters.coverageMinDollars ?? 0,
        coverageMaxDollars: filters.coverageMaxDollars ?? null,
        sort: filters.sort ?? "priority_desc",
      },
    ] as const,
  details: () => [...submissionKeys.all, "detail"] as const,
  detail: (id: string) => [...submissionKeys.details(), id] as const,
}
