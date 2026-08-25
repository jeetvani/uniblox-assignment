import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createSubmission } from "@/test/fixtures"

import { SubmissionsTable } from "./submissions-table"

const defaultProps = {
  isUpdating: false,
  onSelectSubmission: vi.fn(),
  scrollRequest: { key: 0, target: "top" as const },
  selectedSubmissionId: null,
  submissions: [createSubmission()],
  total: 1,
}

describe("SubmissionsTable", () => {
  beforeEach(() => {
    defaultProps.onSelectSubmission.mockReset()
  })

  it("renders required queue information and announces result updates", () => {
    const { rerender } = render(<SubmissionsTable {...defaultProps} />)

    expect(screen.getAllByText("Morgan Davis").length).toBeGreaterThan(0)
    expect(screen.getByText("1 results")).toHaveAttribute("aria-live", "polite")

    rerender(<SubmissionsTable {...defaultProps} isUpdating />)
    expect(screen.getByText("Updating results…")).toBeVisible()
  })

  it("opens a submission with Enter from a desktop row", async () => {
    const user = userEvent.setup()
    render(<SubmissionsTable {...defaultProps} />)
    const row = screen.getByRole("row", {
      name: "Open submission details for Morgan Davis",
    })

    row.focus()
    await user.keyboard("{Enter}")

    expect(defaultProps.onSelectSubmission).toHaveBeenCalledWith("sub_morgan")
  })

  it("opens a submission with Space from a desktop row", async () => {
    const user = userEvent.setup()
    render(<SubmissionsTable {...defaultProps} />)
    const row = screen.getByRole("row", {
      name: "Open submission details for Morgan Davis",
    })

    row.focus()
    await user.keyboard(" ")

    expect(defaultProps.onSelectSubmission).toHaveBeenCalledWith("sub_morgan")
  })

  it.each([
    ["top", 0, "smooth"],
    ["bottom", 1_200, "smooth"],
  ] as const)(
    "scrolls to the %s for a pagination request",
    (target, top, behavior) => {
      const scrollTo = vi.fn()
      const scrollHeight = vi
        .spyOn(HTMLElement.prototype, "scrollHeight", "get")
        .mockReturnValue(1_200)
      vi.spyOn(HTMLElement.prototype, "scrollTo").mockImplementation(scrollTo)

      render(
        <SubmissionsTable
          {...defaultProps}
          scrollRequest={{ key: 1, target }}
        />,
      )

      expect(scrollTo).toHaveBeenCalledWith({ behavior, top })
      scrollHeight.mockRestore()
    },
  )

  it("uses immediate scrolling when reduced motion is preferred", () => {
    const scrollTo = vi.fn()
    vi.mocked(window.matchMedia).mockReturnValueOnce({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })
    vi.spyOn(HTMLElement.prototype, "scrollTo").mockImplementation(scrollTo)

    render(
      <SubmissionsTable
        {...defaultProps}
        scrollRequest={{ key: 1, target: "top" }}
      />,
    )

    expect(scrollTo).toHaveBeenCalledWith({ behavior: "auto", top: 0 })
  })
})
