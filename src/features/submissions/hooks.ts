import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { ApiError } from "@/lib/api-client"

import {
  assertSubmissionDetail,
  getSubmission,
  getSubmissions,
  recordDecision,
  resetMockApi,
} from "./api"
import { submissionKeys } from "./query-keys"
import type {
  DecisionInput,
  SubmissionDetail,
  SubmissionFilters,
} from "./types"

export function useSubmissions(filters: SubmissionFilters) {
  return useQuery({
    queryKey: submissionKeys.list(filters),
    queryFn: ({ signal }) => getSubmissions(filters, signal),
    placeholderData: keepPreviousData,
  })
}

export function useSubmission(id: string | null) {
  return useQuery({
    queryKey: submissionKeys.detail(id ?? ""),
    queryFn: ({ signal }) => getSubmission(id as string, signal),
    enabled: Boolean(id),
  })
}

export function useRecordDecision() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: DecisionInput) => recordDecision(input),
    onSuccess: (submission) => {
      queryClient.setQueryData(submissionKeys.detail(submission.id), submission)
      void queryClient.invalidateQueries({ queryKey: submissionKeys.lists() })
    },
    onError: (error, input) => {
      if (!(error instanceof ApiError) || !error.submission) return

      try {
        assertSubmissionDetail(error.submission)
        queryClient.setQueryData<SubmissionDetail>(
          submissionKeys.detail(input.id),
          error.submission,
        )
        void queryClient.invalidateQueries({ queryKey: submissionKeys.lists() })
      } catch {
        // Ignore malformed conflict payloads; the UI will still show the API error.
      }
    },
  })
}

export function useResetMockApi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: resetMockApi,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: submissionKeys.all })
    },
  })
}
