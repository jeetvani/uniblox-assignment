import type { SubmissionListItem, SubmissionSort } from "./types"

const priorityRank: Record<string, number> = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
}

function missingQueueFieldCount(submission: SubmissionListItem) {
  return [
    !submission.applicant?.name,
    !submission.applicant?.email,
    !submission.group?.id,
    !submission.product,
    submission.coverageAmountCents == null,
    !submission.submittedAt,
    !submission.reviewReason,
    !submission.status,
  ].filter(Boolean).length
}

function compareNullableNumbers(
  left: number | null,
  right: number | null,
  direction: 1 | -1,
) {
  if (left === null && right === null) return 0
  if (left === null) return 1
  if (right === null) return -1
  return (left - right) * direction
}

export function filterSubmissionsForDisplay(
  submissions: SubmissionListItem[],
  filters: {
    product?: string
    priority?: string
    submitted?: "" | "with_date" | "missing_date"
    completeness?: "" | "complete" | "missing"
    coverageMinDollars?: number
    coverageMaxDollars?: number | null
  },
) {
  const minimumCents = (filters.coverageMinDollars ?? 0) * 100
  const maximumCents =
    filters.coverageMaxDollars == null ? null : filters.coverageMaxDollars * 100

  return submissions.filter((submission) => {
    if (filters.product && submission.product !== filters.product) return false
    if (filters.priority && submission.priority !== filters.priority)
      return false
    if (filters.submitted === "with_date" && !submission.submittedAt)
      return false
    if (filters.submitted === "missing_date" && submission.submittedAt)
      return false

    const hasMissingQueueData = missingQueueFieldCount(submission) > 0
    if (filters.completeness === "complete" && hasMissingQueueData) return false
    if (filters.completeness === "missing" && !hasMissingQueueData) return false

    const coverage = submission.coverageAmountCents
    if (minimumCents > 0 && (coverage == null || coverage < minimumCents)) {
      return false
    }
    if (
      maximumCents !== null &&
      (coverage == null || coverage > maximumCents)
    ) {
      return false
    }

    return true
  })
}

/**
 * The API owns its documented sorts. Coverage sorting is an extended frontend
 * feature. For the default priority view, incomplete records receive a stable
 * tie-break within the same priority so reviewers see the submissions that are
 * hardest to process first.
 */
export function orderSubmissionsForDisplay(
  submissions: SubmissionListItem[],
  sort: SubmissionSort,
) {
  if (sort === "coverage_desc" || sort === "coverage_asc") {
    const direction = sort === "coverage_desc" ? -1 : 1
    return submissions
      .map((submission, originalIndex) => ({ submission, originalIndex }))
      .sort((left, right) => {
        const difference = compareNullableNumbers(
          left.submission.coverageAmountCents,
          right.submission.coverageAmountCents,
          direction,
        )
        return difference || left.originalIndex - right.originalIndex
      })
      .map(({ submission }) => submission)
  }

  if (sort !== "priority_desc") return submissions

  return submissions
    .map((submission, originalIndex) => ({ submission, originalIndex }))
    .sort((left, right) => {
      const priorityDifference =
        (priorityRank[right.submission.priority ?? ""] ?? 0) -
        (priorityRank[left.submission.priority ?? ""] ?? 0)

      if (priorityDifference !== 0) return priorityDifference

      const missingFieldDifference =
        missingQueueFieldCount(right.submission) -
        missingQueueFieldCount(left.submission)

      return missingFieldDifference || left.originalIndex - right.originalIndex
    })
    .map(({ submission }) => submission)
}
