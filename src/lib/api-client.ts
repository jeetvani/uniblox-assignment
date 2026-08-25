import { env } from "@/lib/env"

type ApiErrorBody = {
  error?: {
    code?: unknown
    message?: unknown
    details?: unknown
  }
  submission?: unknown
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: unknown
  readonly submission: unknown

  constructor(options: {
    message: string
    status: number
    code?: string
    details?: unknown
    submission?: unknown
  }) {
    super(options.message)
    this.name = "ApiError"
    this.status = options.status
    this.code = options.code ?? "UNKNOWN_ERROR"
    this.details = options.details
    this.submission = options.submission
  }
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    throw new ApiError({
      message: "The server returned an invalid JSON response.",
      status: response.status,
      code: "INVALID_JSON_RESPONSE",
    })
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error

    throw new ApiError({
      message: "Unable to reach the enrollment API.",
      status: 0,
      code: "NETWORK_ERROR",
      details: error,
    })
  }

  const body = await readJson(response)

  if (!response.ok) {
    const errorBody = (body ?? {}) as ApiErrorBody
    const message =
      typeof errorBody.error?.message === "string"
        ? errorBody.error.message
        : `Request failed with status ${response.status}.`

    throw new ApiError({
      message,
      status: response.status,
      code:
        typeof errorBody.error?.code === "string"
          ? errorBody.error.code
          : "REQUEST_FAILED",
      details: errorBody.error?.details,
      submission: errorBody.submission,
    })
  }

  return body as T
}
