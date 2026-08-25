import { describe, expect, it } from "vitest"

import { createSubmission } from "@/test/fixtures"

import {
  filterSubmissionsForDisplay,
  orderSubmissionsForDisplay,
} from "./queue-sorting"

describe("filterSubmissionsForDisplay", () => {
  const complete = createSubmission({
    coverageAmountCents: 25_000_000,
    id: "complete",
    priority: "HIGH",
    product: "Voluntary Life",
    submittedAt: "2026-11-01T08:30:00-05:00",
  })
  const missing = createSubmission({
    applicant: { email: null, name: "Incomplete Applicant" },
    coverageAmountCents: 12_500_000,
    id: "missing",
    priority: "LOW",
    product: "Dental",
    submittedAt: null,
  })

  it("applies categorical and completeness filters locally", () => {
    expect(
      filterSubmissionsForDisplay([complete, missing], {
        completeness: "missing",
        priority: "LOW",
        product: "Dental",
        submitted: "missing_date",
      }).map(({ id }) => id),
    ).toEqual(["missing"])
  })

  it("applies inclusive coverage limits and excludes missing coverage", () => {
    const noCoverage = createSubmission({
      coverageAmountCents: null,
      id: "no-coverage",
    })

    expect(
      filterSubmissionsForDisplay([complete, missing, noCoverage], {
        coverageMinDollars: 125_000,
        coverageMaxDollars: 125_000,
      }).map(({ id }) => id),
    ).toEqual(["missing"])
  })
})

describe("orderSubmissionsForDisplay", () => {
  it("orders higher priorities before lower priorities", () => {
    const low = createSubmission({ id: "low", priority: "LOW" })
    const urgent = createSubmission({ id: "urgent", priority: "URGENT" })
    const high = createSubmission({ id: "high", priority: "HIGH" })

    expect(
      orderSubmissionsForDisplay([low, urgent, high], "priority_desc").map(
        ({ id }) => id,
      ),
    ).toEqual(["urgent", "high", "low"])
  })

  it("promotes incomplete records only within the same priority", () => {
    const completeHigh = createSubmission({
      id: "complete-high",
      priority: "HIGH",
      submittedAt: "2026-11-01T08:30:00-05:00",
    })
    const incompleteHigh = createSubmission({
      applicant: { email: null, name: "Incomplete Applicant" },
      id: "incomplete-high",
      priority: "HIGH",
    })
    const incompleteLow = createSubmission({
      applicant: null,
      id: "incomplete-low",
      priority: "LOW",
    })

    expect(
      orderSubmissionsForDisplay(
        [completeHigh, incompleteLow, incompleteHigh],
        "priority_desc",
      ).map(({ id }) => id),
    ).toEqual(["incomplete-high", "complete-high", "incomplete-low"])
  })

  it("keeps the API order when default-sort records tie", () => {
    const first = createSubmission({ id: "first" })
    const second = createSubmission({ id: "second" })

    expect(
      orderSubmissionsForDisplay([first, second], "priority_desc").map(
        ({ id }) => id,
      ),
    ).toEqual(["first", "second"])
  })

  it("does not alter an explicit non-default API sort", () => {
    const first = createSubmission({ id: "first", priority: "LOW" })
    const second = createSubmission({ id: "second", priority: "URGENT" })

    expect(
      orderSubmissionsForDisplay([first, second], "applicant_asc"),
    ).toEqual([first, second])
  })

  it("orders coverage locally while keeping missing values last", () => {
    const low = createSubmission({ coverageAmountCents: 10_000, id: "low" })
    const high = createSubmission({ coverageAmountCents: 20_000, id: "high" })
    const missing = createSubmission({
      coverageAmountCents: null,
      id: "missing",
    })

    expect(
      orderSubmissionsForDisplay([low, missing, high], "coverage_desc").map(
        ({ id }) => id,
      ),
    ).toEqual(["high", "low", "missing"])
    expect(
      orderSubmissionsForDisplay([high, missing, low], "coverage_asc").map(
        ({ id }) => id,
      ),
    ).toEqual(["low", "high", "missing"])
  })
})
