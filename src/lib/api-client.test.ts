import { HttpResponse, http } from "msw"
import { describe, expect, it } from "vitest"

import { server } from "@/test/server"

import { apiRequest, ApiError } from "./api-client"

describe("apiRequest", () => {
  it("returns parsed JSON for a successful request", async () => {
    server.use(
      http.get("http://localhost/api/example", () =>
        HttpResponse.json({ ok: true }),
      ),
    )

    await expect(apiRequest("/api/example")).resolves.toEqual({ ok: true })
  })

  it("preserves structured API error information", async () => {
    server.use(
      http.get("http://localhost/api/example", () =>
        HttpResponse.json(
          {
            error: {
              code: "REVIEW_CONFLICT",
              details: { reviewer: "another-user" },
              message: "Another reviewer acted first.",
            },
            submission: { id: "sub_1042" },
          },
          { status: 409 },
        ),
      ),
    )

    const error = await apiRequest("/api/example").catch(
      (reason: unknown) => reason,
    )

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      code: "REVIEW_CONFLICT",
      details: { reviewer: "another-user" },
      message: "Another reviewer acted first.",
      status: 409,
      submission: { id: "sub_1042" },
    })
  })

  it("rejects invalid JSON with a specific error", async () => {
    server.use(
      http.get(
        "http://localhost/api/example",
        () => new HttpResponse("not-json", { status: 200 }),
      ),
    )

    await expect(apiRequest("/api/example")).rejects.toMatchObject({
      code: "INVALID_JSON_RESPONSE",
      status: 200,
    })
  })

  it("turns a transport failure into a readable network error", async () => {
    server.use(
      http.get("http://localhost/api/example", () => HttpResponse.error()),
    )

    await expect(apiRequest("/api/example")).rejects.toMatchObject({
      code: "NETWORK_ERROR",
      message: "Unable to reach the enrollment API.",
      status: 0,
    })
  })
})
