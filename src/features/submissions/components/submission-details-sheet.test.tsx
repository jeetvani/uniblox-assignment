import { HttpResponse, delay, http } from "msw"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { createSubmissionDetail } from "@/test/fixtures"
import { renderWithProviders } from "@/test/render"
import { server } from "@/test/server"

import { SubmissionDetailsSheet } from "./submission-details-sheet"

const detailUrl = "http://localhost/api/submissions/:id"

describe("SubmissionDetailsSheet", () => {
  it("shows a loading lifecycle while details are pending", () => {
    server.use(
      http.get(detailUrl, async () => {
        await delay("infinite")
        return HttpResponse.json(createSubmissionDetail())
      }),
    )

    renderWithProviders(
      <SubmissionDetailsSheet
        onOpenChange={vi.fn()}
        submissionId="sub_morgan"
      />,
    )

    expect(screen.getByLabelText("Loading submission details")).toBeVisible()
  })

  it("renders review signals and every enrollment section", async () => {
    server.use(
      http.get(detailUrl, () => HttpResponse.json(createSubmissionDetail())),
    )

    renderWithProviders(
      <SubmissionDetailsSheet
        onOpenChange={vi.fn()}
        submissionId="sub_morgan"
      />,
    )

    expect(
      await screen.findByRole("heading", { name: "Morgan Davis" }),
    ).toBeVisible()
    expect(screen.getByText("Submission date was not provided.")).toBeVisible()
    for (const section of [
      "Submission",
      "Employee",
      "Employment",
      "Election",
      "Existing coverage",
    ]) {
      expect(screen.getByRole("heading", { name: section })).toBeVisible()
    }
  })

  it("labels missing fields explicitly", async () => {
    server.use(
      http.get(detailUrl, () =>
        HttpResponse.json(
          createSubmissionDetail({
            applicant: { email: null, name: "Morgan Davis" },
            employee: null,
          }),
        ),
      ),
    )

    renderWithProviders(
      <SubmissionDetailsSheet
        onOpenChange={vi.fn()}
        submissionId="sub_morgan"
      />,
    )

    expect(await screen.findByText("Email not provided")).toBeVisible()
    expect(screen.getByText("Employee ID not provided")).toBeVisible()
    expect(screen.getByText("Phone not provided")).toBeVisible()
  })

  it("retries a failed detail request", async () => {
    const user = userEvent.setup()
    let requests = 0
    server.use(
      http.get(detailUrl, () => {
        requests += 1
        if (requests === 1) {
          return HttpResponse.json(
            { error: { message: "Details unavailable" } },
            { status: 503 },
          )
        }
        return HttpResponse.json(createSubmissionDetail())
      }),
    )

    renderWithProviders(
      <SubmissionDetailsSheet
        onOpenChange={vi.fn()}
        submissionId="sub_morgan"
      />,
    )

    expect(await screen.findByText("Details unavailable")).toBeVisible()
    await user.click(screen.getByRole("button", { name: "Try again" }))

    expect(
      await screen.findByRole("heading", { name: "Morgan Davis" }),
    ).toBeVisible()
    expect(requests).toBe(2)
  })

  it("requests closure from the close control", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    server.use(
      http.get(detailUrl, () => HttpResponse.json(createSubmissionDetail())),
    )
    renderWithProviders(
      <SubmissionDetailsSheet
        onOpenChange={onOpenChange}
        submissionId="sub_morgan"
      />,
    )

    await screen.findByRole("heading", { name: "Morgan Davis" })
    await user.click(
      screen.getByRole("button", { name: "Close submission details" }),
    )

    expect(onOpenChange).toHaveBeenCalled()
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(false)
  })
})
