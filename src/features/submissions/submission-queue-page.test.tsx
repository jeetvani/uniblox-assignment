import { HttpResponse, delay, http } from "msw"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"

import { createSubmission } from "@/test/fixtures"
import { renderWithProviders } from "@/test/render"
import { server } from "@/test/server"

import { useQueueStore } from "./queue-store"
import { SubmissionQueuePage } from "./submission-queue-page"

const listUrl = "http://localhost/api/submissions"

describe("SubmissionQueuePage", () => {
  beforeEach(() => {
    useQueueStore.setState(useQueueStore.getInitialState(), true)
  })

  it("renders an accessible loading state while the queue is pending", () => {
    server.use(
      http.get(listUrl, async () => {
        await delay("infinite")
        return HttpResponse.json({ items: [], total: 0 })
      }),
    )

    renderWithProviders(<SubmissionQueuePage />)

    expect(
      screen.getByLabelText("Loading enrollment submissions"),
    ).toBeVisible()
  })

  it("retries a failed queue request", async () => {
    const user = userEvent.setup()
    let requests = 0
    server.use(
      http.get(listUrl, () => {
        requests += 1
        if (requests === 1) {
          return HttpResponse.json(
            { error: { message: "Queue temporarily unavailable" } },
            { status: 503 },
          )
        }
        const submission = createSubmission()
        return HttpResponse.json({ items: [submission], total: 1 })
      }),
    )

    renderWithProviders(<SubmissionQueuePage />)

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Queue temporarily unavailable",
    )
    await user.click(screen.getByRole("button", { name: "Try again" }))

    expect(await screen.findAllByText("Morgan Davis")).not.toHaveLength(0)
    expect(requests).toBe(2)
  })

  it("renders required queue data after a successful request", async () => {
    const submission = createSubmission()
    server.use(
      http.get(listUrl, () =>
        HttpResponse.json({ items: [submission], total: 1 }),
      ),
    )

    renderWithProviders(<SubmissionQueuePage />)

    expect(await screen.findAllByText("Morgan Davis")).not.toHaveLength(0)
    expect(
      screen.getAllByText("Atlas Retail Cooperative").length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText("Voluntary Life").length).toBeGreaterThan(0)
    expect(screen.getAllByText("$125,000").length).toBeGreaterThan(0)
    expect(screen.getByText("1 results")).toHaveAttribute("aria-live", "polite")
  })

  it("shows a filtered empty state and clears every filter", async () => {
    const user = userEvent.setup()
    useQueueStore.getState().setSearchInput("Unknown")
    useQueueStore.getState().commitSearch("Unknown")
    server.use(
      http.get(listUrl, ({ request }) => {
        const query = new URL(request.url).searchParams.get("query")
        return HttpResponse.json(
          query
            ? { items: [], total: 0 }
            : { items: [createSubmission()], total: 1 },
        )
      }),
    )

    renderWithProviders(<SubmissionQueuePage />)

    expect(
      await screen.findByRole("heading", { name: "No matching submissions" }),
    ).toBeVisible()
    await user.click(screen.getByRole("button", { name: "Clear all filters" }))

    expect(await screen.findAllByText("Morgan Davis")).not.toHaveLength(0)
    expect(useQueueStore.getState()).toMatchObject({
      query: "",
      searchInput: "",
    })
  })

  it("debounces applicant search before requesting filtered results", async () => {
    const user = userEvent.setup()
    const requestedQueries: string[] = []
    server.use(
      http.get(listUrl, ({ request }) => {
        const query = new URL(request.url).searchParams.get("query") ?? ""
        requestedQueries.push(query)
        const submission = createSubmission()
        return HttpResponse.json({
          items:
            query && !"morgan davis".includes(query.toLowerCase())
              ? []
              : [submission],
          total: 1,
        })
      }),
    )

    renderWithProviders(<SubmissionQueuePage />)
    await screen.findAllByText("Morgan Davis")

    await user.type(screen.getAllByRole("searchbox")[0], "Morgan")
    expect(requestedQueries).not.toContain("Morgan")

    await waitFor(() => expect(requestedQueries).toContain("Morgan"), {
      timeout: 1_000,
    })
  })

  it("clamps the current page when filtering reduces the total", async () => {
    useQueueStore.getState().setPage(3)
    server.use(
      http.get(listUrl, () =>
        HttpResponse.json({ items: [createSubmission()], total: 1 }),
      ),
    )

    renderWithProviders(<SubmissionQueuePage />)

    await screen.findAllByText("Morgan Davis")
    await waitFor(() => expect(useQueueStore.getState().page).toBe(1))
  })
})
