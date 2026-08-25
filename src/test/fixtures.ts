import type {
  SubmissionDetail,
  SubmissionListItem,
} from "@/features/submissions/types"

export function createSubmission(
  overrides: Partial<SubmissionListItem> = {},
): SubmissionListItem {
  return {
    applicant: { email: "morgan@example.com", name: "Morgan Davis" },
    coverageAmountCents: 12_500_000,
    effectiveDate: "2027-01-01",
    group: { id: "grp_atlas", name: "Atlas Retail Cooperative" },
    id: "sub_morgan",
    priority: "HIGH",
    product: "Voluntary Life",
    reviewReason: "MISSING_INFORMATION",
    status: "NEEDS_REVIEW",
    submittedAt: null,
    ...overrides,
  }
}

export function createSubmissionDetail(
  overrides: Partial<SubmissionDetail> = {},
): SubmissionDetail {
  return {
    ...createSubmission(),
    election: {
      beneficiaryCount: 1,
      planName: "Voluntary Life Plus",
      requestedCoverageCents: 12_500_000,
      tobaccoUse: false,
    },
    employee: {
      address: {
        city: "Austin",
        line1: "100 Congress Avenue",
        line2: null,
        postalCode: "78701",
        state: "TX",
      },
      dateOfBirth: "1990-04-12",
      employeeId: "EMP-1042",
      phone: "555-0100",
    },
    employment: {
      annualSalaryCents: 8_500_000,
      employmentStatus: "ACTIVE",
      hireDate: "2023-01-10",
      hoursPerWeek: 40,
      occupation: "Operations Manager",
    },
    existingCoverage: {
      coverageAmountCents: 5_000_000,
      effectiveDate: "2026-01-01",
      policyNumber: "POL-100",
    },
    reviewSignals: [
      {
        code: "MISSING_DATE",
        field: "submittedAt",
        message: "Submission date was not provided.",
        severity: "WARNING",
      },
    ],
    ...overrides,
  }
}
