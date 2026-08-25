import { AlertTriangle, FileWarning } from "lucide-react"
import { useState } from "react"

import { AppSheet, AppText, AppView } from "@/components/ui/primary"
import { cn } from "@/lib/utils"

import {
  formatCurrency,
  formatDate,
  formatSubmittedAt,
  humanizeCode,
} from "../formatters"
import { useSubmission } from "../hooks"
import type { Address, ReviewSignal, SubmissionDetail } from "../types"
import { DecisionPanel } from "./decision-panel"
import { DetailField, DetailSection } from "./submission-detail-fields"

function formatAddress(address: Address | null | undefined) {
  if (!address) return null
  const locality = [address.city, address.state, address.postalCode]
    .filter(Boolean)
    .join(", ")
  return (
    [address.line1, address.line2, locality].filter(Boolean).join(" · ") || null
  )
}

function formatBoolean(value: boolean | null | undefined) {
  if (typeof value !== "boolean") return null
  return value ? "Yes" : "No"
}

const signalStyles: Record<string, string> = {
  HIGH: "border-red-200/80 bg-red-50/70 text-red-950",
  MEDIUM: "border-amber-200/80 bg-amber-50/70 text-amber-950",
  LOW: "border-sky-200/80 bg-sky-50/70 text-sky-950",
}

function ReviewSignalCard({ signal }: { signal: ReviewSignal }) {
  const severity = signal.severity ?? "UNKNOWN"

  return (
    <AppView
      className={cn(
        "rounded-xl border p-4",
        signalStyles[severity] ?? "border-slate-200 bg-slate-50 text-slate-900",
      )}
    >
      <div className="flex items-start gap-3">
        <FileWarning aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <AppText className="text-inherit" variant="label">
              {humanizeCode(signal.code)}
            </AppText>
            <span className="rounded-full border border-current/15 bg-white/45 px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase">
              {humanizeCode(signal.severity)}
            </span>
          </div>
          <AppText className="mt-1.5 text-inherit/80" variant="body">
            {signal.message ?? "No additional review information was provided."}
          </AppText>
          {signal.field ? (
            <AppText
              className="mt-2 font-mono text-[11px] text-inherit/65"
              variant="caption"
            >
              {signal.field}
            </AppText>
          ) : null}
        </div>
      </div>
    </AppView>
  )
}

function DetailsLoadingState() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading submission details"
      className="space-y-7"
    >
      {Array.from({ length: 4 }, (_, section) => (
        <div className="space-y-4" key={section}>
          <div className="h-5 w-36 animate-pulse rounded-full bg-slate-200" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }, (_, field) => (
              <div className="space-y-2" key={field}>
                <div className="h-3 w-20 animate-pulse rounded-full bg-slate-200" />
                <div className="h-5 animate-pulse rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function DetailsErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <AppView className="grid min-h-[420px] place-items-center text-center">
      <div className="max-w-sm">
        <span className="mx-auto mb-4 grid size-11 place-items-center rounded-full bg-red-50 text-red-700">
          <AlertTriangle aria-hidden="true" className="size-5" />
        </span>
        <AppText as="h3" variant="sectionTitle">
          Details could not be loaded
        </AppText>
        <AppText className="mt-2" tone="muted" variant="body">
          {message}
        </AppText>
        <button
          className="mt-5 h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          onClick={onRetry}
          type="button"
        >
          Try again
        </button>
      </div>
    </AppView>
  )
}

function SubmissionDetails({ submission }: { submission: SubmissionDetail }) {
  return (
    <div className="space-y-7">
      <section aria-labelledby="review-signals-heading">
        <div className="mb-3 flex items-center justify-between gap-3">
          <AppText as="h3" id="review-signals-heading" variant="sectionTitle">
            Why this needs attention
          </AppText>
          <AppText as="span" variant="caption">
            {submission.reviewSignals?.length ?? 0} signals
          </AppText>
        </div>
        {submission.reviewSignals?.length ? (
          <div className="space-y-3">
            {submission.reviewSignals.map((signal, index) => (
              <ReviewSignalCard
                key={`${signal.code ?? "signal"}-${index}`}
                signal={signal}
              />
            ))}
          </div>
        ) : (
          <AppView className="p-4" surface="subtle">
            <AppText tone="muted" variant="body">
              No review signals were provided by the source system.
            </AppText>
          </AppView>
        )}
      </section>

      <DetailSection title="Submission">
        <DetailField label="Employer group" value={submission.group?.name} />
        <DetailField label="Product" value={submission.product} />
        <DetailField
          label="Requested coverage"
          value={formatCurrency(submission.coverageAmountCents)}
        />
        <DetailField
          label="Submitted"
          value={formatSubmittedAt(submission.submittedAt)}
        />
        <DetailField
          label="Review reason"
          value={
            submission.reviewReason
              ? humanizeCode(submission.reviewReason)
              : null
          }
        />
        <DetailField
          label="Status"
          value={submission.status ? humanizeCode(submission.status) : null}
        />
      </DetailSection>

      <DetailSection title="Employee">
        <DetailField
          label="Employee ID"
          value={submission.employee?.employeeId}
        />
        <DetailField label="Email" value={submission.applicant?.email} />
        <DetailField label="Phone" value={submission.employee?.phone} />
        <DetailField
          label="Date of birth"
          value={formatDate(submission.employee?.dateOfBirth)}
        />
        <DetailField
          fullWidth
          label="Address"
          value={formatAddress(submission.employee?.address)}
        />
      </DetailSection>

      <DetailSection title="Employment">
        <DetailField
          label="Employment status"
          value={
            submission.employment?.employmentStatus
              ? humanizeCode(submission.employment.employmentStatus)
              : null
          }
        />
        <DetailField
          label="Hire date"
          value={formatDate(submission.employment?.hireDate)}
        />
        <DetailField
          label="Occupation"
          value={submission.employment?.occupation}
        />
        <DetailField
          label="Annual salary"
          value={formatCurrency(submission.employment?.annualSalaryCents)}
        />
        <DetailField
          label="Hours per week"
          value={submission.employment?.hoursPerWeek}
        />
      </DetailSection>

      <DetailSection title="Election">
        <DetailField label="Plan" value={submission.election?.planName} />
        <DetailField
          label="Effective date"
          value={formatDate(submission.effectiveDate)}
        />
        <DetailField
          label="Elected coverage"
          value={formatCurrency(submission.election?.requestedCoverageCents)}
        />
        <DetailField
          label="Beneficiaries"
          value={submission.election?.beneficiaryCount}
        />
        <DetailField
          label="Tobacco use"
          value={formatBoolean(submission.election?.tobaccoUse)}
        />
      </DetailSection>

      <DetailSection title="Existing coverage">
        <DetailField
          label="Coverage amount"
          value={formatCurrency(
            submission.existingCoverage?.coverageAmountCents,
          )}
        />
        <DetailField
          label="Effective date"
          value={formatDate(submission.existingCoverage?.effectiveDate)}
        />
        <DetailField
          label="Policy number"
          value={submission.existingCoverage?.policyNumber}
        />
      </DetailSection>
    </div>
  )
}

export function SubmissionDetailsSheet({
  submissionId,
  onOpenChange,
}: {
  submissionId: string | null
  onOpenChange: (open: boolean) => void
}) {
  const [retainedSubmissionId, setRetainedSubmissionId] = useState(submissionId)

  if (submissionId && submissionId !== retainedSubmissionId) {
    setRetainedSubmissionId(submissionId)
  }

  const activeSubmissionId = submissionId ?? retainedSubmissionId
  const query = useSubmission(activeSubmissionId)
  const submission = query.data
  const applicantName = submission?.applicant?.name ?? "Submission details"

  return (
    <AppSheet
      description={
        submission
          ? `${submission.id} · ${submission.applicant?.email ?? "Email not provided"}`
          : (activeSubmissionId ?? undefined)
      }
      eyebrow={
        submission?.priority
          ? `${humanizeCode(submission.priority)} priority`
          : "Enrollment submission"
      }
      footer={
        submission ? (
          <DecisionPanel
            key={submission.id}
            onClose={() => onOpenChange(false)}
            submission={submission}
          />
        ) : undefined
      }
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen && !submissionId) {
          setRetainedSubmissionId(null)
        }
      }}
      open={Boolean(submissionId)}
      title={applicantName}
    >
      {query.isPending ? <DetailsLoadingState /> : null}
      {query.isError ? (
        <DetailsErrorState
          message={query.error.message}
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.isSuccess ? <SubmissionDetails submission={query.data} /> : null}
    </AppSheet>
  )
}
