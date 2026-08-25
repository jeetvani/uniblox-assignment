import { HttpResponse, delay, http } from "msw"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { createSubmissionDetail } from "@/test/fixtures"
import { renderWithProviders } from "@/test/render"
import { server } from "@/test/server"

import { DecisionPanel } from "./decision-panel"

const decisionUrl = "http://localhost/api/submissions/:id/decision"

describe("DecisionPanel", () => {
  it("opens and cancels approval confirmation without sending a request", async () => {
    const user = userEvent.setup()
    let requestCount = 0
    server.use(
      http.post(decisionUrl, () => {
        requestCount += 1
        return HttpResponse.json(createSubmissionDetail({ status: "APPROVED" }))
      }),
    )
    renderWithProviders(
      <DecisionPanel onClose={vi.fn()} submission={createSubmissionDetail()} />,
    )

    await user.click(screen.getByRole("button", { name: "Approve" }))
    expect(
      screen.getByText("Approve this enrollment submission?"),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Cancel" }))

    expect(screen.getByRole("button", { name: "Approve" })).toBeVisible()
    expect(requestCount).toBe(0)
  })

  it("prevents duplicate approval actions while saving", async () => {
    const user = userEvent.setup()
    let requestCount = 0
    server.use(
      http.post(decisionUrl, async () => {
        requestCount += 1
        await delay(100)
        return HttpResponse.json(createSubmissionDetail({ status: "APPROVED" }))
      }),
    )
    renderWithProviders(
      <DecisionPanel onClose={vi.fn()} submission={createSubmissionDetail()} />,
    )

    await user.click(screen.getByRole("button", { name: "Approve" }))
    await user.click(screen.getByRole("button", { name: "Confirm approval" }))

    const pendingButton = screen.getByRole("button", { name: "Approving…" })
    expect(pendingButton).toBeDisabled()
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled()

    await screen.findByRole("status")
    expect(requestCount).toBe(1)
  })

  it("exposes an explicit approval retry after a temporary failure", async () => {
    const user = userEvent.setup()
    let requestCount = 0
    server.use(
      http.post(decisionUrl, () => {
        requestCount += 1
        if (requestCount === 1) {
          return HttpResponse.json(
            {
              error: {
                code: "TEMPORARILY_UNAVAILABLE",
                message: "The decision service is temporarily unavailable.",
              },
            },
            { status: 503 },
          )
        }
        return HttpResponse.json(createSubmissionDetail({ status: "APPROVED" }))
      }),
    )
    renderWithProviders(
      <DecisionPanel onClose={vi.fn()} submission={createSubmissionDetail()} />,
    )

    await user.click(screen.getByRole("button", { name: "Approve" }))
    await user.click(screen.getByRole("button", { name: "Confirm approval" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The decision service is temporarily unavailable.",
    )
    await user.click(screen.getByRole("button", { name: "Retry approval" }))

    expect(await screen.findByRole("status")).toHaveTextContent(
      "This submission is now approved.",
    )
    expect(requestCount).toBe(2)
  })

  it("requires a non-whitespace correction note", async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <DecisionPanel onClose={vi.fn()} submission={createSubmissionDetail()} />,
    )

    await user.click(
      screen.getByRole("button", { name: "Return for correction" }),
    )
    const submit = screen.getByRole("button", { name: "Return for correction" })
    const note = screen.getByLabelText("Correction note")

    expect(submit).toBeDisabled()
    await user.type(note, "   ")
    expect(submit).toBeDisabled()
    await user.type(note, "Coverage needs confirmation")
    expect(submit).toBeEnabled()
    expect(screen.getByText("30/500")).toBeVisible()
  })

  it("trims the return note before sending it", async () => {
    const user = userEvent.setup()
    let requestBody: unknown
    server.use(
      http.post(decisionUrl, async ({ request }) => {
        requestBody = await request.json()
        return HttpResponse.json(createSubmissionDetail({ status: "RETURNED" }))
      }),
    )
    renderWithProviders(
      <DecisionPanel onClose={vi.fn()} submission={createSubmissionDetail()} />,
    )

    await user.click(
      screen.getByRole("button", { name: "Return for correction" }),
    )
    await user.type(screen.getByLabelText("Correction note"), "  Fix email  ")
    await user.click(
      screen.getByRole("button", { name: "Return for correction" }),
    )

    await screen.findByRole("status")
    expect(requestBody).toEqual({ decision: "RETURN", note: "Fix email" })
  })

  it("preserves the return note after a failed request", async () => {
    const user = userEvent.setup()
    server.use(
      http.post(decisionUrl, () =>
        HttpResponse.json(
          {
            error: {
              code: "TEMPORARILY_UNAVAILABLE",
              message: "Please retry the return.",
            },
          },
          { status: 503 },
        ),
      ),
    )
    renderWithProviders(
      <DecisionPanel onClose={vi.fn()} submission={createSubmissionDetail()} />,
    )

    await user.click(
      screen.getByRole("button", { name: "Return for correction" }),
    )
    const note = screen.getByLabelText("Correction note")
    await user.type(note, "Please provide the missing date")
    await user.click(
      screen.getByRole("button", { name: "Return for correction" }),
    )

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Please retry the return.",
    )
    expect(note).toHaveValue("Please provide the missing date")
  })

  it("limits correction notes to 500 characters", async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <DecisionPanel onClose={vi.fn()} submission={createSubmissionDetail()} />,
    )

    await user.click(
      screen.getByRole("button", { name: "Return for correction" }),
    )
    const note = screen.getByLabelText("Correction note")
    await user.type(note, "a".repeat(501))

    expect(note).toHaveValue("a".repeat(500))
    expect(screen.getByText("500/500")).toBeVisible()
  })

  it("renders an announced final state for an already-decided submission", () => {
    const onClose = vi.fn()
    renderWithProviders(
      <DecisionPanel
        onClose={onClose}
        submission={createSubmissionDetail({ status: "RETURNED" })}
      />,
    )

    expect(screen.getByRole("status")).toHaveTextContent(
      "This submission is now returned.",
    )
  })

  it("closes from the successful decision state", async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(
      <DecisionPanel
        onClose={onClose}
        submission={createSubmissionDetail({ status: "APPROVED" })}
      />,
    )

    await user.click(screen.getByRole("button", { name: "Close" }))

    expect(onClose).toHaveBeenCalledOnce()
  })
})
