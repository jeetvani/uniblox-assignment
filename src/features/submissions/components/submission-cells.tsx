import { AlertCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { AppText, AppView } from "@/components/ui/primary"
import { TableCell } from "@/components/ui/table"
import { cn } from "@/lib/utils"

import { formatCurrency, formatSubmittedAt, humanizeCode } from "../formatters"
import type { SubmissionListItem } from "../types"

function MissingValue({
  label,
  compact = false,
}: {
  label: string
  compact?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full min-w-0 items-center gap-1.5 whitespace-normal rounded-full border border-amber-200/70 bg-amber-50/70 font-medium text-amber-800",
        compact ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
      )}
    >
      <AlertCircle aria-hidden="true" className="size-3.5 shrink-0" />
      {label} not provided
    </span>
  )
}

export function ApplicantCell({
  applicant,
}: Pick<SubmissionListItem, "applicant">) {
  return (
    <TableCell className="min-w-0 overflow-hidden whitespace-normal">
      {applicant?.name ? (
        <AppView>
          <AppText className="text-slate-950" variant="label">
            {applicant.name}
          </AppText>
          {applicant.email ? (
            <AppText className="mt-0.5" truncate variant="caption">
              {applicant.email}
            </AppText>
          ) : (
            <div className="mt-1">
              <MissingValue compact label="Email" />
            </div>
          )}
        </AppView>
      ) : (
        <MissingValue label="Applicant" />
      )}
    </TableCell>
  )
}

export function EmployerGroupCell({
  group,
}: Pick<SubmissionListItem, "group">) {
  return (
    <TableCell className="hidden min-w-0 overflow-hidden whitespace-normal md:table-cell">
      {group?.name ? (
        <AppText className="line-clamp-2 text-slate-700" variant="body">
          {group.name}
        </AppText>
      ) : (
        <MissingValue label="Employer group" />
      )}
    </TableCell>
  )
}

export function ProductCell({ product }: Pick<SubmissionListItem, "product">) {
  return (
    <TableCell className="hidden min-w-0 overflow-hidden whitespace-normal sm:table-cell">
      {product ? (
        <AppText className="line-clamp-2 text-slate-700" variant="body">
          {product}
        </AppText>
      ) : (
        <MissingValue label="Product" />
      )}
    </TableCell>
  )
}

export function CoverageCell({
  coverageAmountCents,
}: Pick<SubmissionListItem, "coverageAmountCents">) {
  const value = formatCurrency(coverageAmountCents)

  return (
    <TableCell className="hidden min-w-0 md:table-cell">
      {value ? (
        <AppText
          as="span"
          className="font-semibold text-slate-800 tabular-nums"
          variant="label"
        >
          {value}
        </AppText>
      ) : (
        <MissingValue compact label="Coverage" />
      )}
    </TableCell>
  )
}

export function SubmittedAtCell({
  submittedAt,
}: Pick<SubmissionListItem, "submittedAt">) {
  const value = formatSubmittedAt(submittedAt)

  return (
    <TableCell className="hidden min-w-0 whitespace-normal xl:table-cell">
      {value ? (
        <AppText as="span" className="text-slate-600" variant="caption">
          {value}
        </AppText>
      ) : (
        <MissingValue compact label="Submission date" />
      )}
    </TableCell>
  )
}

export function ReviewReasonCell({
  reviewReason,
}: Pick<SubmissionListItem, "reviewReason">) {
  return (
    <TableCell className="hidden min-w-0 overflow-hidden whitespace-normal lg:table-cell">
      {reviewReason ? (
        <Badge
          className="h-auto max-w-full whitespace-normal border-slate-200 bg-slate-50 px-2.5 py-1 text-left leading-4 text-slate-700"
          variant="outline"
        >
          {humanizeCode(reviewReason)}
        </Badge>
      ) : (
        <MissingValue compact label="Review reason" />
      )}
    </TableCell>
  )
}

const priorityStyles: Record<string, string> = {
  URGENT: "bg-red-50 text-red-800 ring-red-200",
  HIGH: "bg-orange-50 text-orange-800 ring-orange-200",
  MEDIUM: "bg-amber-50 text-amber-800 ring-amber-200",
  LOW: "bg-emerald-50 text-emerald-800 ring-emerald-200",
}

const priorityDots: Record<string, string> = {
  URGENT: "bg-red-600",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-amber-500",
  LOW: "bg-emerald-500",
}

export function PriorityCell({
  priority,
}: Pick<SubmissionListItem, "priority">) {
  return (
    <TableCell className="min-w-0">
      {priority ? (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
            priorityStyles[priority] ??
              "bg-slate-50 text-slate-700 ring-slate-200",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "size-1.5 rounded-full",
              priorityDots[priority] ?? "bg-slate-400",
            )}
          />
          {humanizeCode(priority)}
        </span>
      ) : (
        <MissingValue compact label="Priority" />
      )}
    </TableCell>
  )
}

export function StatusCell({ status }: Pick<SubmissionListItem, "status">) {
  return (
    <TableCell className="min-w-0 whitespace-normal">
      {status ? (
        <AppText
          as="span"
          className="font-semibold text-slate-700"
          variant="caption"
        >
          {humanizeCode(status)}
        </AppText>
      ) : (
        <MissingValue compact label="Status" />
      )}
    </TableCell>
  )
}
