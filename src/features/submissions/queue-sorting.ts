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

/**
 * The API owns the selected sort. For the default priority view, incomplete
 * records receive a stable tie-break within the same priority so reviewers see
 * the submissions that are hardest to process first.
 */
export function orderSubmissionsForDisplay(
  submissions: SubmissionListItem[],
  sort: SubmissionSort,
) {
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
