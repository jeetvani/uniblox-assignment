import { useLayoutEffect, useRef } from "react"

import { AppText, AppView } from "@/components/ui/primary"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { SubmissionListItem } from "../types"
import { MobileSubmissionCard } from "./mobile-submission-card"
import {
  ApplicantCell,
  CoverageCell,
  EmployerGroupCell,
  PriorityCell,
  ProductCell,
  ReviewReasonCell,
  StatusCell,
  SubmittedAtCell,
} from "./submission-cells"

function SubmissionRow({
  submission,
  isSelected,
  onSelect,
}: {
  submission: SubmissionListItem
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  const applicantName = submission.applicant?.name ?? "unnamed applicant"

  return (
    <TableRow
      aria-haspopup="dialog"
      aria-label={`Open submission details for ${applicantName}`}
      className="h-[74px] cursor-pointer bg-white hover:bg-[#f7f9f6] focus-visible:bg-[#f2f6f2] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#397267] data-[state=selected]:bg-[#eef5ef]"
      data-state={isSelected ? "selected" : undefined}
      onClick={() => onSelect(submission.id)}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return
        event.preventDefault()
        onSelect(submission.id)
      }}
      tabIndex={0}
    >
      <ApplicantCell applicant={submission.applicant} />
      <EmployerGroupCell group={submission.group} />
      <ProductCell product={submission.product} />
      <CoverageCell coverageAmountCents={submission.coverageAmountCents} />
      <SubmittedAtCell submittedAt={submission.submittedAt} />
      <ReviewReasonCell reviewReason={submission.reviewReason} />
      <PriorityCell priority={submission.priority} />
      <StatusCell status={submission.status} />
    </TableRow>
  )
}

type SubmissionsTableProps = {
  submissions: SubmissionListItem[]
  total: number
  isUpdating: boolean
  selectedSubmissionId: string | null
  scrollRequest: {
    key: number
    target: "top" | "bottom"
  }
  onSelectSubmission: (id: string) => void
}

export function SubmissionsTable({
  submissions,
  total,
  isUpdating,
  selectedSubmissionId,
  scrollRequest,
  onSelectSubmission,
}: SubmissionsTableProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (scrollRequest.key === 0) return

    const frame = window.requestAnimationFrame(() => {
      const scrollContainer = scrollContainerRef.current
      if (!scrollContainer) return

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches

      scrollContainer.scrollTo({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        top: scrollRequest.target === "top" ? 0 : scrollContainer.scrollHeight,
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [scrollRequest])

  return (
    <AppView
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      surface="panel"
    >
      <div className="flex min-h-12 shrink-0 items-center justify-between border-b border-border px-4 sm:px-5">
        <AppText as="h2" variant="sectionTitle">
          Submissions
        </AppText>
        <AppText
          aria-live="polite"
          as="span"
          className="tabular-nums"
          variant="caption"
        >
          {isUpdating ? "Updating results…" : `${total} results`}
        </AppText>
      </div>

      <div
        className="min-h-0 flex-1 overflow-x-clip overflow-y-auto overscroll-contain"
        data-queue-scroll
        ref={scrollContainerRef}
      >
        <ul className="grid gap-2 p-2 sm:p-3 md:grid-cols-2 xl:hidden">
          {submissions.map((submission) => (
            <MobileSubmissionCard
              isSelected={selectedSubmissionId === submission.id}
              key={submission.id}
              onSelect={onSelectSubmission}
              submission={submission}
            />
          ))}
        </ul>

        <Table className="hidden table-fixed xl:table">
          <TableHeader className="sticky top-0 z-10 bg-[#f6f7f5] shadow-[0_1px_0_rgb(15_23_42/0.08)]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[42%] pl-4 sm:w-[30%] sm:pl-5 md:w-[22%] lg:w-[18%] xl:w-[16%]">
                Applicant
              </TableHead>
              <TableHead className="hidden w-[18%] md:table-cell lg:w-[16%] xl:w-[16%]">
                Employer group
              </TableHead>
              <TableHead className="hidden w-[24%] sm:table-cell md:w-[18%] lg:w-[16%] xl:w-[14%]">
                Product
              </TableHead>
              <TableHead className="hidden w-[14%] md:table-cell lg:w-[12%] xl:w-[10%]">
                Coverage
              </TableHead>
              <TableHead className="hidden w-[16%] xl:table-cell">
                Submitted
              </TableHead>
              <TableHead className="hidden w-[16%] lg:table-cell xl:w-[14%]">
                Review reason
              </TableHead>
              <TableHead className="w-[25%] sm:w-[18%] md:w-[14%] lg:w-[10%] xl:w-[8%]">
                Priority
              </TableHead>
              <TableHead className="w-[33%] pr-4 sm:w-[20%] sm:pr-5 md:w-[14%] lg:w-[12%] xl:w-[6%]">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <SubmissionRow
                isSelected={selectedSubmissionId === submission.id}
                key={submission.id}
                onSelect={onSelectSubmission}
                submission={submission}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </AppView>
  )
}
