import { beforeEach, describe, expect, it } from "vitest"

import { getQueueFilters, useQueueStore } from "./queue-store"

describe("useQueueStore", () => {
  beforeEach(() => {
    useQueueStore.setState(useQueueStore.getInitialState(), true)
  })

  it("trims a committed search and resets pagination", () => {
    useQueueStore.getState().setPage(3)
    useQueueStore.getState().commitSearch("  Morgan Davis  ")

    expect(useQueueStore.getState()).toMatchObject({
      page: 1,
      query: "Morgan Davis",
    })
  })

  it.each([
    ["group", () => useQueueStore.getState().setGroup("grp_atlas")],
    ["reason", () => useQueueStore.getState().setReason("MISSING_INFORMATION")],
    ["sort", () => useQueueStore.getState().setSort("submitted_desc")],
    ["coverage", () => useQueueStore.getState().setCoverageRange(100, 500)],
  ])("resets pagination when %s changes", (_label, update) => {
    useQueueStore.getState().setPage(4)
    update()

    expect(useQueueStore.getState().page).toBe(1)
  })

  it("resets only extended filters when requested", () => {
    const state = useQueueStore.getState()
    state.setSearchInput("Morgan")
    state.commitSearch("Morgan")
    state.setGroup("grp_atlas")
    state.setReason("MISSING_INFORMATION")
    state.setSort("applicant_asc")
    state.setProduct("Voluntary Life")
    state.setPriority("HIGH")
    state.setSubmitted("missing_date")
    state.setCompleteness("missing")
    state.setCoverageRange(100, 500)

    useQueueStore.getState().resetExtendedFilters()

    expect(useQueueStore.getState()).toMatchObject({
      completeness: "",
      coverageMaxDollars: null,
      coverageMinDollars: 0,
      group: "grp_atlas",
      priority: "",
      product: "",
      query: "Morgan",
      reason: "MISSING_INFORMATION",
      searchInput: "Morgan",
      sort: "applicant_asc",
      submitted: "",
    })
  })

  it("restores the complete default filter state", () => {
    const state = useQueueStore.getState()
    state.setSearchInput("Morgan")
    state.commitSearch("Morgan")
    state.setGroup("grp_atlas")
    state.setProduct("Voluntary Life")
    state.setSort("submitted_desc")

    useQueueStore.getState().resetFilters()

    expect(getQueueFilters(useQueueStore.getState())).toEqual({
      completeness: "",
      coverageMaxDollars: null,
      coverageMinDollars: 0,
      group: "",
      priority: "",
      product: "",
      query: "",
      reason: "",
      sort: "priority_desc",
      submitted: "",
    })
    expect(useQueueStore.getState()).toMatchObject({ page: 1, searchInput: "" })
  })

  it("selects and closes a submission without resetting the queue", () => {
    useQueueStore.getState().setPage(2)
    useQueueStore.getState().selectSubmission("sub_1042")
    useQueueStore.getState().closeSubmission()

    expect(useQueueStore.getState()).toMatchObject({
      page: 2,
      selectedSubmissionId: null,
    })
  })
})
