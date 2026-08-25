import {
  AlertTriangle,
  Check,
  CornerUpLeft,
  LoaderCircle,
  RotateCcw,
} from "lucide-react"
import { useState } from "react"

import { AppText } from "@/components/ui/primary"
import { ApiError } from "@/lib/api-client"

import { useRecordDecision } from "../hooks"
import type { SubmissionDetail } from "../types"

type DecisionMode = "idle" | "approve" | "return"

function resizeReturnNote(textarea: HTMLTextAreaElement) {
  const minimumHeight = 96
  const maximumHeight = 240

  textarea.style.height = "0px"
  const nextHeight = Math.min(
    Math.max(textarea.scrollHeight, minimumHeight),
    maximumHeight,
  )
  textarea.style.height = `${nextHeight}px`
  textarea.style.overflowY =
    textarea.scrollHeight > maximumHeight ? "auto" : "hidden"
}

export function DecisionPanel({
  submission,
  onClose,
}: {
  submission: SubmissionDetail
  onClose: () => void
}) {
  const [mode, setMode] = useState<DecisionMode>("idle")
  const [note, setNote] = useState("")
  const [isRetryingApproval, setIsRetryingApproval] = useState(false)
  const decision = useRecordDecision()

  const isFinal =
    submission.status === "APPROVED" || submission.status === "RETURNED"
  const errorMessage =
    decision.error instanceof ApiError
      ? decision.error.message
      : decision.isError
        ? "The decision could not be saved. Please try again."
        : null

  if (decision.isError && isFinal) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          aria-atomic="true"
          className="flex items-start gap-2 text-amber-900"
          role="alert"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-amber-50">
            <AlertTriangle aria-hidden="true" className="size-4" />
          </span>
          <div>
            <AppText className="text-amber-950" variant="label">
              Submission updated by another reviewer
            </AppText>
            <AppText className="text-amber-800" variant="caption">
              Your decision was not recorded. {errorMessage} Current status:{" "}
              {submission.status?.toLocaleLowerCase("en-US")}.
            </AppText>
          </div>
        </div>
        <button
          className="h-10 rounded-lg border border-border bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>
    )
  }

  if (decision.isSuccess || isFinal) {
    const status = decision.data?.status ?? submission.status
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          aria-atomic="true"
          className="flex items-center gap-2 text-emerald-800"
          role="status"
        >
          <span className="grid size-8 place-items-center rounded-full bg-emerald-50">
            <Check aria-hidden="true" className="size-4" />
          </span>
          <div>
            <AppText className="text-emerald-900" variant="label">
              Decision recorded
            </AppText>
            <AppText className="text-emerald-700" variant="caption">
              This submission is now {status?.toLocaleLowerCase("en-US")}.
            </AppText>
          </div>
        </div>
        <button
          className="h-10 rounded-lg border border-border bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>
    )
  }

  if (mode === "return") {
    return (
      <div className="animate-in fade-in-0 slide-in-from-bottom-2 zoom-in-[0.985] duration-300 ease-out motion-reduce:animate-none">
        <div className="mb-3 flex items-center justify-between gap-4">
          <AppText
            as="label"
            className="text-base leading-6 sm:text-lg"
            htmlFor="return-note"
            variant="label"
          >
            Correction note
          </AppText>
          <AppText className="tabular-nums" variant="caption">
            {note.length}/500
          </AppText>
        </div>
        <textarea
          autoFocus
          className="min-h-24 max-h-60 w-full resize-none overflow-y-hidden rounded-xl border border-input bg-white px-4 py-3 text-base leading-7 outline-none transition-[height,border-color,box-shadow] duration-200 placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20 motion-reduce:transition-none"
          disabled={decision.isPending}
          id="return-note"
          maxLength={500}
          onChange={(event) => {
            setNote(event.target.value)
            resizeReturnNote(event.currentTarget)
          }}
          placeholder="Explain what needs to be corrected…"
          rows={3}
          value={note}
        />
        {errorMessage ? (
          <AppText
            className="mt-2"
            role="alert"
            tone="danger"
            variant="caption"
          >
            {errorMessage}
          </AppText>
        ) : null}
        <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
            disabled={decision.isPending}
            onClick={() => {
              decision.reset()
              setIsRetryingApproval(false)
              setMode("idle")
            }}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 text-sm font-semibold text-white hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:pointer-events-none disabled:opacity-50"
            disabled={!note.trim() || decision.isPending}
            onClick={() =>
              decision.mutate({
                id: submission.id,
                decision: "RETURN",
                note: note.trim(),
              })
            }
            type="button"
          >
            {decision.isPending ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
            ) : (
              <CornerUpLeft aria-hidden="true" className="size-4" />
            )}
            {decision.isPending ? "Returning…" : "Return for correction"}
          </button>
        </div>
      </div>
    )
  }

  if (mode === "approve") {
    return (
      <div>
        <AppText variant="label">Approve this enrollment submission?</AppText>
        <AppText className="mt-1" tone="muted" variant="caption">
          This records a final decision and removes it from the active queue.
        </AppText>
        {errorMessage ? (
          <AppText
            className="mt-2"
            role="alert"
            tone="danger"
            variant="caption"
          >
            {errorMessage}
          </AppText>
        ) : null}
        <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
            disabled={decision.isPending}
            onClick={() => {
              decision.reset()
              setIsRetryingApproval(false)
              setMode("idle")
            }}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex h-10 min-w-40 items-center justify-center gap-2 rounded-lg bg-[#245f55] px-4 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-[#1c4e46] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245f55] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none"
            disabled={decision.isPending}
            onClick={() => {
              setIsRetryingApproval(decision.isError)
              decision.mutate({ id: submission.id, decision: "APPROVE" })
            }}
            type="button"
          >
            {decision.isPending ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
            ) : decision.isError ? (
              <RotateCcw aria-hidden="true" className="size-4" />
            ) : (
              <Check aria-hidden="true" className="size-4" />
            )}
            {decision.isPending
              ? isRetryingApproval
                ? "Retrying…"
                : "Approving…"
              : decision.isError
                ? "Retry approval"
                : "Confirm approval"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-slate-700 transition-[transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-amber-300/70 hover:bg-amber-50/50 hover:shadow-sm active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transform-none motion-reduce:transition-none"
        onClick={() => setMode("return")}
        type="button"
      >
        <CornerUpLeft aria-hidden="true" className="size-4" />
        Return for correction
      </button>
      <button
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#245f55] px-4 text-sm font-semibold text-white hover:bg-[#1c4e46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245f55]"
        onClick={() => setMode("approve")}
        type="button"
      >
        <Check aria-hidden="true" className="size-4" />
        Approve
      </button>
    </div>
  )
}
