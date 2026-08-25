import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  QueueEmptyState,
  QueueErrorState,
  QueueLoadingState,
} from "./queue-states"

describe("queue lifecycle states", () => {
  it("exposes an accessible loading state", () => {
    render(<QueueLoadingState />)

    expect(
      screen.getByLabelText("Loading enrollment submissions"),
    ).toHaveAttribute("aria-busy", "true")
  })

  it("announces a queue error and retries on request", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<QueueErrorState message="API unavailable" onRetry={onRetry} />)

    expect(screen.getByRole("alert")).toHaveTextContent("API unavailable")
    await user.click(screen.getByRole("button", { name: "Try again" }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it("offers a reset when active filters have no matches", async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()
    render(<QueueEmptyState hasActiveFilters onReset={onReset} />)

    expect(
      screen.getByRole("heading", { name: "No matching submissions" }),
    ).toBeVisible()
    await user.click(screen.getByRole("button", { name: "Clear all filters" }))
    expect(onReset).toHaveBeenCalledOnce()
  })

  it("does not offer an irrelevant reset when the entire queue is clear", () => {
    render(<QueueEmptyState hasActiveFilters={false} onReset={vi.fn()} />)

    expect(
      screen.getByRole("heading", { name: "The queue is clear" }),
    ).toBeVisible()
    expect(
      screen.queryByRole("button", { name: "Clear all filters" }),
    ).not.toBeInTheDocument()
  })
})
