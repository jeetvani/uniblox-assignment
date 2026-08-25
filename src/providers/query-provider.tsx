import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type PropsWithChildren } from "react"

import { ApiError } from "@/lib/api-client"

function shouldRetryQuery(failureCount: number, error: Error) {
  if (failureCount >= 2) return false
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false
  }
  return true
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: shouldRetryQuery,
        refetchOnWindowFocus: true,
      },
      mutations: {
        // Decisions are intentionally never retried automatically. The UI
        // should let the reviewer explicitly retry a failed write.
        retry: false,
      },
    },
  })
}

export function QueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
