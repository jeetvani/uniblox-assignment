import { AlertCircle, ChevronRight } from "lucide-react"
import type { ReactNode } from "react"

import { AppText } from "@/components/ui/primary"
import { cn } from "@/lib/utils"

import { formatCurrency, formatSubmittedAt, humanizeCode } from "../formatters"
import type { SubmissionListItem } from "../types"

const priorityStyles: Record<string, string> = {
  URGENT: "bg-red-50 text-red-800 ring-red-200",
  HIGH: "bg-orange-50 text-orange-800 ring-orange-200",
  MEDIUM: "bg-amber-50 text-amber-800 ring-amber-200",
  LOW: "bg-emerald-50 text-emerald-800 ring-emerald-200",
}

function MobileMissingValue({ label }: { label: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1 text-xs font-semibold text-amber-800">
      <AlertCircle aria-hidden="true" className="size-3.5 shrink-0" />
      {label} not provided
    </span>
  )
}

function MobileQueueField({
  label,
  value,
  missingLabel = label,
  emphasis = false,
}: {
  label: string
  value: ReactNode
  missingLabel?: string
  emphasis?: boolean
}) {
  const isMissing = value === null || value === undefined || value === ""

  return (
    <span className="min-w-0">
      <AppText
        as="span"
        className="block text-[10px] tracking-[0.12em] uppercase"
        variant="caption"
      >
        {label}
      </AppText>
      {isMissing ? (
        <span className="mt-1 block">
          <MobileMissingValue label={missingLabel} />
        </span>
      ) : (
        <AppText
          as="span"
          className={cn(
            "mt-1 block line-clamp-2 text-[13px] leading-5 text-slate-700",
            emphasis && "font-semibold text-slate-950 tabular-nums",
          )}
          variant="label"
        >
          {value}
        </AppText>
      )}
    </span>
  )
}

export function MobileSubmissionCard({
  submission,
  isSelected,
  onSelect,
}: {
  submission: SubmissionListItem
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  const applicantName = submission.applicant?.name
  const coverage = formatCurrency(submission.coverageAmountCents)
  const submitted = formatSubmittedAt(submission.submittedAt)

  return (
    <li className="min-w-0">
      <button
        aria-haspopup="dialog"
        aria-label={`Open submission details for ${applicantName ?? "unnamed applicant"}`}
        className="group relative h-full w-full overflow-hidden rounded-2xl border border-slate-900/8 bg-white p-4 pr-9 text-left shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-emerald-900/15 hover:bg-[#fbfcfa] hover:shadow-[0_10px_24px_rgb(15_23_42/0.08)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#397267] data-[state=selected]:border-[#397267]/35 data-[state=selected]:bg-[#f2f8f3] motion-reduce:transform-none motion-reduce:transition-none"
        data-state={isSelected ? "selected" : undefined}
        onClick={() => onSelect(submission.id)}
        type="button"
      >
        <span className="flex min-w-0 items-start justify-between gap-3">
          <span className="min-w-0 flex-1">
            {applicantName ? (
              <AppText
                as="span"
                className="block truncate text-base font-semibold text-slate-950"
                variant="label"
              >
                {applicantName}
              </AppText>
            ) : (
              <MobileMissingValue label="Applicant" />
            )}
            {submission.applicant?.email ? (
              <AppText
                as="span"
                className="mt-0.5 block truncate"
                variant="caption"
              >
                {submission.applicant.email}
              </AppText>
            ) : (
              <span className="mt-1 block">
                <MobileMissingValue label="Email" />
              </span>
            )}
          </span>

          {submission.priority ? (
            <span
              className={cn(
                "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset",
                priorityStyles[submission.priority] ??
                  "bg-slate-50 text-slate-700 ring-slate-200",
              )}
            >
              {humanizeCode(submission.priority)}
            </span>
          ) : (
            <MobileMissingValue label="Priority" />
          )}
        </span>

        <span className="my-3 block h-px bg-slate-900/7" />

        <span className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-3">
          <MobileQueueField
            label="Employer"
            missingLabel="Employer group"
            value={submission.group?.name}
          />
          <MobileQueueField label="Product" value={submission.product} />
          <MobileQueueField emphasis label="Coverage" value={coverage} />
          <MobileQueueField
            label="Submitted"
            missingLabel="Submission date"
            value={submitted}
          />
        </span>

        <span className="mt-3 flex min-w-0 flex-wrap items-center gap-2 border-t border-slate-900/7 pt-3">
          {submission.reviewReason ? (
            <span className="max-w-full truncate rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
              {humanizeCode(submission.reviewReason)}
            </span>
          ) : (
            <MobileMissingValue label="Review reason" />
          )}
          {submission.status ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
              {humanizeCode(submission.status)}
            </span>
          ) : (
            <MobileMissingValue label="Status" />
          )}
        </span>

        <ChevronRight
          aria-hidden="true"
          className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#397267] motion-reduce:transition-none"
        />
      </button>
    </li>
  )
}
