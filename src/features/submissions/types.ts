export type SubmissionSort =
  | "priority_desc"
  | "coverage_desc"
  | "coverage_asc"
  | "submitted_desc"
  | "submitted_asc"
  | "applicant_asc"

export type SubmissionDateFilter = "" | "with_date" | "missing_date"
export type SubmissionCompletenessFilter = "" | "complete" | "missing"

export type SubmissionFilters = {
  query?: string
  group?: string
  reason?: string
  product?: string
  priority?: string
  submitted?: SubmissionDateFilter
  completeness?: SubmissionCompletenessFilter
  coverageMinDollars?: number
  coverageMaxDollars?: number | null
  sort?: SubmissionSort
}

export type Applicant = {
  name: string | null
  email: string | null
}

export type EmployerGroup = {
  id: string | null
  name: string | null
}

export type SubmissionListItem = {
  id: string
  applicant: Applicant | null
  group: EmployerGroup | null
  product: string | null
  coverageAmountCents: number | null
  submittedAt: string | null
  effectiveDate: string | null
  reviewReason: string | null
  priority: string | null
  status: string | null
}

export type Address = {
  line1: string | null
  line2: string | null
  city: string | null
  state: string | null
  postalCode: string | null
}

export type Employee = {
  employeeId: string | null
  dateOfBirth: string | null
  phone: string | null
  address: Address | null
}

export type Employment = {
  employmentStatus: string | null
  hireDate: string | null
  annualSalaryCents: number | null
  occupation: string | null
  hoursPerWeek: number | null
}

export type Election = {
  planName: string | null
  requestedCoverageCents: number | null
  beneficiaryCount: number | null
  tobaccoUse: boolean | null
}

export type ExistingCoverage = {
  coverageAmountCents: number | null
  effectiveDate: string | null
  policyNumber: string | null
}

export type ReviewSignal = {
  code: string | null
  severity: string | null
  field: string | null
  message: string | null
}

export type RecordedDecision = {
  type: "APPROVE" | "RETURN"
  note: string | null
  reviewedBy: string | null
}

export type SubmissionDetail = SubmissionListItem & {
  employee: Employee | null
  employment: Employment | null
  election: Election | null
  existingCoverage: ExistingCoverage | null
  reviewSignals: ReviewSignal[] | null
  decision?: RecordedDecision | null
  decidedAt?: string | null
}

export type SubmissionListResponse = {
  items: SubmissionListItem[]
  total: number
}

export type DecisionInput = {
  id: string
  decision: "APPROVE" | "RETURN"
  note?: string
}

export type ResetResponse = {
  ok: boolean
  total: number
}
