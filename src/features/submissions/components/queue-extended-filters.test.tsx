import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import type { QueueExtendedFiltersProps } from "./queue-extended-filters"
import { QueueExtendedFilters } from "./queue-extended-filters"

function createProps(
  overrides: Partial<QueueExtendedFiltersProps> = {},
): QueueExtendedFiltersProps {
  return {
    completeness: "",
    coverageMaxDollars: null,
    coverageMinDollars: 0,
    coverageRangeMaximum: 1_000_000,
    hasActiveFilters: false,
    onCompletenessChange: vi.fn(),
    onCoverageRangeChange: vi.fn(),
    onPriorityChange: vi.fn(),
    onProductChange: vi.fn(),
    onReset: vi.fn(),
    onSubmittedChange: vi.fn(),
    priorities: ["HIGH", "MEDIUM", "LOW"],
    priority: "",
    product: "",
    products: ["Dental", "Voluntary Life"],
    submitted: "",
    ...overrides,
  }
}

describe("QueueExtendedFilters", () => {
  it("renders an accessible two-sided coverage range", () => {
    render(<QueueExtendedFilters {...createProps()} />)

    expect(
      screen.getByRole("slider", { name: "Minimum coverage" }),
    ).toHaveAttribute("aria-valuetext", "$0")
    expect(
      screen.getByRole("slider", { name: "Maximum coverage" }),
    ).toHaveAttribute("aria-valuetext", "$1,000,000")
    expect(
      screen.getByRole("spinbutton", { name: "Minimum coverage" }),
    ).toHaveValue(0)
    expect(
      screen.getByRole("spinbutton", { name: "Maximum coverage" }),
    ).toHaveValue(1_000_000)
  })

  it("commits exact coverage values when an input loses focus", () => {
    const onCoverageRangeChange = vi.fn()
    render(<QueueExtendedFilters {...createProps({ onCoverageRangeChange })} />)
    const minimum = screen.getByRole("spinbutton", {
      name: "Minimum coverage",
    })

    fireEvent.change(minimum, { target: { value: "25000" } })
    fireEvent.blur(minimum)

    expect(onCoverageRangeChange).toHaveBeenCalledWith(25_000, null)
  })

  it("does not allow the maximum input to cross below the minimum", () => {
    const onCoverageRangeChange = vi.fn()
    render(
      <QueueExtendedFilters
        {...createProps({
          coverageMinDollars: 25_000,
          onCoverageRangeChange,
        })}
      />,
    )
    const maximum = screen.getByRole("spinbutton", {
      name: "Maximum coverage",
    })

    fireEvent.change(maximum, { target: { value: "100" } })
    fireEvent.blur(maximum)

    expect(onCoverageRangeChange).toHaveBeenCalledWith(25_000, 25_000)
  })

  it("changes a custom select through its accessible options", async () => {
    const user = userEvent.setup()
    const onProductChange = vi.fn()
    render(<QueueExtendedFilters {...createProps({ onProductChange })} />)

    await user.click(screen.getByRole("combobox", { name: "Product" }))
    await user.click(screen.getByRole("option", { name: "Dental" }))

    expect(onProductChange).toHaveBeenCalledWith("Dental")
  })

  it("enables reset only when extended filters are active", async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()
    const { rerender } = render(
      <QueueExtendedFilters {...createProps({ onReset })} />,
    )
    const reset = screen.getByRole("button", {
      name: "Clear extended filters",
    })

    expect(reset).toBeDisabled()
    rerender(
      <QueueExtendedFilters
        {...createProps({ hasActiveFilters: true, onReset })}
      />,
    )
    await user.click(reset)

    expect(onReset).toHaveBeenCalledOnce()
  })
})
