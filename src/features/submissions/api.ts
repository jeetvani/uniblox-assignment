import { apiRequest, ApiError } from "@/lib/api-client"

import type {
  DecisionInput,
  ResetResponse,
  SubmissionDetail,
  SubmissionFilters,
  SubmissionListResponse,
} from "./types"

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function assertListResponse(
  value: unknown,
): asserts value is SubmissionListResponse {
  if (
    !isObject(value) ||
    !Array.isArray(value.items) ||
    typeof value.total !== "number"
  ) {
    throw new ApiError({
      message: "The submissions endpoint returned an unexpected response.",
      status: 0,
      code: "INVALID_LIST_RESPONSE",
    })
  }
}

export function assertSubmissionDetail(
  value: unknown,
): asserts value is SubmissionDetail {
  if (!isObject(value) || typeof value.id !== "string") {
    throw new ApiError({
      message: "The submission endpoint returned an unexpected response.",
      status: 0,
      code: "INVALID_SUBMISSION_RESPONSE",
    })
  }
}

export async function getSubmissions(
  filters: SubmissionFilters,
  signal?: AbortSignal,
): Promise<SubmissionListResponse> {
  const params = new URLSearchParams()

  if (filters.query?.trim()) params.set("query", filters.query.trim())
  if (filters.group) params.set("group", filters.group)
  if (filters.reason) params.set("reason", filters.reason)
  const serverSort =
    filters.sort === "coverage_desc" || filters.sort === "coverage_asc"
      ? "priority_desc"
      : (filters.sort ?? "priority_desc")
  params.set("sort", serverSort)

  const response = await apiRequest<unknown>(
    `/api/submissions?${params.toString()}`,
    { signal },
  )
  assertListResponse(response)
  return response
}

export async function getSubmission(
  id: string,
  signal?: AbortSignal,
): Promise<SubmissionDetail> {
  const response = await apiRequest<unknown>(
    `/api/submissions/${encodeURIComponent(id)}`,
    { signal },
  )
  assertSubmissionDetail(response)
  return response
}

export async function recordDecision({
  id,
  decision,
  note,
}: DecisionInput): Promise<SubmissionDetail> {
  const response = await apiRequest<unknown>(
    `/api/submissions/${encodeURIComponent(id)}/decision`,
    {
      method: "POST",
      body: JSON.stringify({
        decision,
        ...(note === undefined ? {} : { note }),
      }),
    },
  )
  assertSubmissionDetail(response)
  return response
}

export function resetMockApi(): Promise<ResetResponse> {
  return apiRequest<ResetResponse>("/api/reset", { method: "POST" })
}
