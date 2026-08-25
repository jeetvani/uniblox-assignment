import { QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import { HttpResponse, http } from "msw"
import type { PropsWithChildren } from "react"
import { describe, expect, it } from "vitest"

import { createSubmissionDetail } from "@/test/fixtures"
import { createTestQueryClient } from "@/test/render"
import { server } from "@/test/server"

import { useRecordDecision } from "./hooks"
import { submissionKeys } from "./query-keys"

const decisionUrl = "http://localhost/api/submissions/:id/decision"

describe("useRecordDecision", () => {
  it("updates details and invalidates every list after success", async () => {
    const queryClient = createTestQueryClient()
    const updated = createSubmissionDetail({ status: "APPROVED" })
    queryClient.setQueryData(
      submissionKeys.detail(updated.id),
      createSubmissionDetail(),
    )
    queryClient.setQueryData(submissionKeys.list({ sort: "priority_desc" }), {
      items: [createSubmissionDetail()],
      total: 1,
    })
    server.use(http.post(decisionUrl, () => HttpResponse.json(updated)))
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useRecordDecision(), { wrapper })

    await act(() =>
      result.current.mutateAsync({ decision: "APPROVE", id: updated.id }),
    )

    expect(queryClient.getQueryData(submissionKeys.detail(updated.id))).toEqual(
      updated,
    )
    expect(
      queryClient.getQueryState(submissionKeys.list({ sort: "priority_desc" }))
        ?.isInvalidated,
    ).toBe(true)
  })

  it("uses a valid conflict payload to refresh stale detail data", async () => {
    const queryClient = createTestQueryClient()
    const conflictSubmission = createSubmissionDetail({ status: "APPROVED" })
    server.use(
      http.post(decisionUrl, () =>
        HttpResponse.json(
          {
            error: {
              code: "REVIEW_CONFLICT",
              message: "Another reviewer decided this submission first.",
            },
            submission: conflictSubmission,
          },
          { status: 409 },
        ),
      ),
    )
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useRecordDecision(), { wrapper })

    await expect(
      act(() =>
        result.current.mutateAsync({
          decision: "APPROVE",
          id: conflictSubmission.id,
        }),
      ),
    ).rejects.toMatchObject({ code: "REVIEW_CONFLICT" })

    await waitFor(() => {
      expect(
        queryClient.getQueryData(submissionKeys.detail(conflictSubmission.id)),
      ).toEqual(conflictSubmission)
    })
  })

  it("ignores malformed conflict payloads without hiding the API error", async () => {
    const queryClient = createTestQueryClient()
    server.use(
      http.post(decisionUrl, () =>
        HttpResponse.json(
          {
            error: { code: "REVIEW_CONFLICT", message: "Conflict" },
            submission: { status: "APPROVED" },
          },
          { status: 409 },
        ),
      ),
    )
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useRecordDecision(), { wrapper })

    await expect(
      act(() =>
        result.current.mutateAsync({
          decision: "APPROVE",
          id: "sub_morgan",
        }),
      ),
    ).rejects.toMatchObject({ code: "REVIEW_CONFLICT" })
    expect(
      queryClient.getQueryData(submissionKeys.detail("sub_morgan")),
    ).toBeUndefined()
  })
})
