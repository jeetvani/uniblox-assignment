import { describe, expect, it } from "vitest"

import { createSubmission } from "@/test/fixtures"

import { orderSubmissionsForDisplay } from "./queue-sorting"

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
})
