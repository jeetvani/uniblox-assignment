import { HttpResponse, http } from "msw"
import { describe, expect, it } from "vitest"

import { createSubmission, createSubmissionDetail } from "@/test/fixtures"
import { server } from "@/test/server"

import { getSubmission, getSubmissions, recordDecision } from "./api"

describe("submissions API", () => {
  it("serializes every active list filter", async () => {
    let requestedUrl: URL | undefined
    server.use(
      http.get("http://localhost/api/submissions", ({ request }) => {
        requestedUrl = new URL(request.url)
        return HttpResponse.json({ items: [], total: 0 })
      }),
    )

    await getSubmissions({
      completeness: "missing",
      coverageMaxDollars: 1_000,
      coverageMinDollars: 100,
      group: "grp_atlas",
      priority: "HIGH",
      product: "Voluntary Life",
      query: "  Morgan  ",
      reason: "MISSING_INFORMATION",
      sort: "coverage_desc",
      submitted: "missing_date",
    })

    expect(Object.fromEntries(requestedUrl?.searchParams ?? [])).toEqual({
      completeness: "missing",
      coverageMax: "1000",
      coverageMin: "100",
      group: "grp_atlas",
      priority: "HIGH",
      product: "Voluntary Life",
      query: "Morgan",
      reason: "MISSING_INFORMATION",
      sort: "coverage_desc",
      submitted: "missing_date",
    })
  })

  it("uses only the default sort when filters are empty", async () => {
    let requestedUrl: URL | undefined
    server.use(
      http.get("http://localhost/api/submissions", ({ request }) => {
        requestedUrl = new URL(request.url)
        return HttpResponse.json({ items: [], total: 0 })
      }),
    )

    await getSubmissions({})

    expect(requestedUrl?.search).toBe("?sort=priority_desc")
  })

  it("rejects an invalid list response", async () => {
    server.use(
      http.get("http://localhost/api/submissions", () =>
        HttpResponse.json({ records: [] }),
      ),
    )

    await expect(getSubmissions({})).rejects.toMatchObject({
      code: "INVALID_LIST_RESPONSE",
    })
  })

  it("encodes a submission ID and rejects an invalid detail response", async () => {
    let pathname = ""
    server.use(
      http.get("http://localhost/api/submissions/:id", ({ request }) => {
        pathname = new URL(request.url).pathname
        return HttpResponse.json({ value: "invalid" })
      }),
    )

    await expect(getSubmission("id with spaces")).rejects.toMatchObject({
      code: "INVALID_SUBMISSION_RESPONSE",
    })
    expect(pathname).toBe("/api/submissions/id%20with%20spaces")
  })

  it.each([
    {
      expectedBody: { decision: "APPROVE" },
      input: { decision: "APPROVE" as const, id: "sub_morgan" },
    },
    {
      expectedBody: { decision: "RETURN", note: "Correct the coverage" },
      input: {
        decision: "RETURN" as const,
        id: "sub_morgan",
        note: "Correct the coverage",
      },
    },
  ])("records a $input.decision decision", async ({ expectedBody, input }) => {
    let body: unknown
    server.use(
      http.post(
        "http://localhost/api/submissions/:id/decision",
        async ({ request }) => {
          body = await request.json()
          return HttpResponse.json(
            createSubmissionDetail({
              status: input.decision === "APPROVE" ? "APPROVED" : "RETURNED",
            }),
          )
        },
      ),
    )

    await recordDecision(input)

    expect(body).toEqual(expectedBody)
  })

  it("accepts a valid list response", async () => {
    const submission = createSubmission()
    server.use(
      http.get("http://localhost/api/submissions", () =>
        HttpResponse.json({ items: [submission], total: 1 }),
      ),
    )

    await expect(getSubmissions({})).resolves.toEqual({
      items: [submission],
      total: 1,
    })
  })
})
