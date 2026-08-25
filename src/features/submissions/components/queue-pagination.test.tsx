import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { QueuePagination } from "./queue-pagination"

describe("QueuePagination", () => {
  it("announces the page and displays the visible result range", () => {
    render(
      <QueuePagination
        onPageChange={vi.fn()}
        page={2}
        pageSize={10}
        total={25}
      />,
    )

    expect(screen.getByText("11–20 of 25")).toBeVisible()
    expect(screen.getByText("2 / 3")).toHaveAttribute("aria-live", "polite")
    expect(screen.getByText("Page 2 of 3")).toHaveAttribute(
      "aria-live",
      "polite",
    )
  })

  it("disables every previous control on the first page", () => {
    render(
      <QueuePagination
        onPageChange={vi.fn()}
        page={1}
        pageSize={10}
        total={25}
      />,
    )

    for (const button of screen.getAllByRole("button", {
      name: "Previous page",
    })) {
      expect(button).toBeDisabled()
    }
  })

  it("disables every next control on the final page", () => {
    render(
      <QueuePagination
        onPageChange={vi.fn()}
        page={3}
        pageSize={10}
        total={25}
      />,
    )

    for (const button of screen.getAllByRole("button", { name: "Next page" })) {
      expect(button).toBeDisabled()
    }
  })

  it("requests the next and previous page", async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(
      <QueuePagination
        onPageChange={onPageChange}
        page={2}
        pageSize={10}
        total={25}
      />,
    )

    await user.click(screen.getAllByRole("button", { name: "Next page" })[0])
    await user.click(
      screen.getAllByRole("button", { name: "Previous page" })[0],
    )

    expect(onPageChange).toHaveBeenNthCalledWith(1, 3)
    expect(onPageChange).toHaveBeenNthCalledWith(2, 1)
  })

  it("handles an empty result range", () => {
    render(
      <QueuePagination
        onPageChange={vi.fn()}
        page={1}
        pageSize={10}
        total={0}
      />,
    )

    expect(screen.getByText("0–0 of 0")).toBeVisible()
  })
})
