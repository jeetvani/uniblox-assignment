import { Slider } from "@base-ui/react/slider"
import { DollarSign, RotateCcw } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { ChangeEvent, KeyboardEvent } from "react"

import { Input } from "@/components/ui/input"
import { AppSelect, AppText } from "@/components/ui/primary"

import type {
  SubmissionCompletenessFilter,
  SubmissionDateFilter,
} from "../types"

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

function dollarsToPosition(value: number, maximum: number) {
  if (value <= 0) return 0
  const lowestPositiveValue = Math.min(250, maximum)
  if (value <= lowestPositiveValue) return 1
  const logarithmicPosition =
    Math.log(value / lowestPositiveValue) /
    Math.log(maximum / lowestPositiveValue)
  return 1 + logarithmicPosition * 99
}

function positionToDollars(position: number, maximum: number) {
  if (position < 0.5) return 0
  if (position >= 99.5) return maximum
  const lowestPositiveValue = Math.min(250, maximum)
  const normalizedPosition = clamp((position - 1) / 99, 0, 1)
  const rawValue =
    lowestPositiveValue *
    Math.exp(normalizedPosition * Math.log(maximum / lowestPositiveValue))
  const step =
    rawValue < 10_000
      ? 250
      : rawValue < 100_000
        ? 1_000
        : rawValue < 1_000_000
          ? 5_000
          : rawValue < 10_000_000
            ? 50_000
            : 1_000_000

  return clamp(Math.round(rawValue / step) * step, 0, maximum)
}

function CoverageInput({
  label,
  value,
  maximum,
  onChange,
  onCommit,
}: {
  label: string
  value: number
  maximum: number
  onChange: (value: number) => void
  onCommit: () => void
}) {
  return (
    <label className="min-w-0">
      <AppText as="span" variant="caption">
        {label}
      </AppText>
      <span className="relative mt-1.5 block">
        <DollarSign
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400"
        />
        <Input
          aria-label={`${label} coverage`}
          className="h-10 rounded-xl bg-white pr-3 pl-8 font-medium tabular-nums"
          inputMode="numeric"
          max={maximum}
          min={0}
          onBlur={onCommit}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChange(clamp(Number(event.target.value) || 0, 0, maximum))
          }
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") event.currentTarget.blur()
          }}
          type="number"
          value={value}
        />
      </span>
    </label>
  )
}

function CoverageRangeFilter({
  minimum,
  maximum,
  rangeMaximum,
  onChange,
}: {
  minimum: number
  maximum: number | null
  rangeMaximum: number
  onChange: (minimum: number, maximum: number | null) => void
}) {
  const resolvedMaximum = maximum ?? rangeMaximum
  const commitTimerRef = useRef<number | null>(null)
  const [draftRange, setDraftRange] = useState<[number, number]>([
    minimum,
    resolvedMaximum,
  ])

  const commitRange = (nextRange = draftRange) => {
    const nextMinimum = clamp(
      Math.min(nextRange[0], nextRange[1]),
      0,
      rangeMaximum,
    )
    const nextMaximum = clamp(
      Math.max(nextRange[0], nextRange[1]),
      nextMinimum,
      rangeMaximum,
    )
    setDraftRange([nextMinimum, nextMaximum])
    onChange(nextMinimum, nextMaximum >= rangeMaximum ? null : nextMaximum)
  }

  const scheduleRangeCommit = (nextRange: [number, number]) => {
    if (commitTimerRef.current !== null) {
      window.clearTimeout(commitTimerRef.current)
    }
    commitTimerRef.current = window.setTimeout(() => {
      commitRange(nextRange)
      commitTimerRef.current = null
    }, 250)
  }

  useEffect(
    () => () => {
      if (commitTimerRef.current !== null) {
        window.clearTimeout(commitTimerRef.current)
      }
    },
    [],
  )

  const sliderValue = [
    dollarsToPosition(draftRange[0], rangeMaximum),
    dollarsToPosition(draftRange[1], rangeMaximum),
  ] as const

  return (
    <section className="rounded-2xl border border-emerald-900/10 bg-[linear-gradient(135deg,rgba(239,248,242,0.92),rgba(255,255,255,0.96))] p-4 sm:p-5 lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <AppText as="h3" className="text-base" variant="sectionTitle">
            Coverage range
          </AppText>
          <AppText className="mt-1" tone="muted" variant="caption">
            Set exact limits or drag both handles to narrow the queue.
          </AppText>
        </div>
        <AppText className="tabular-nums" tone="brand" variant="label">
          {currencyFormatter.format(draftRange[0])} –{" "}
          {currencyFormatter.format(draftRange[1])}
        </AppText>
      </div>

      <Slider.Root<readonly number[]>
        className="mt-5"
        max={100}
        min={0}
        minStepsBetweenValues={1}
        onValueChange={(positions) => {
          const nextRange: [number, number] = [
            positionToDollars(positions[0] ?? 0, rangeMaximum),
            positionToDollars(positions[1] ?? 100, rangeMaximum),
          ]
          setDraftRange(nextRange)
          scheduleRangeCommit(nextRange)
        }}
        onValueCommitted={(positions) => {
          if (commitTimerRef.current !== null) {
            window.clearTimeout(commitTimerRef.current)
            commitTimerRef.current = null
          }
          commitRange([
            positionToDollars(positions[0] ?? 0, rangeMaximum),
            positionToDollars(positions[1] ?? 100, rangeMaximum),
          ])
        }}
        step={1}
        thumbCollisionBehavior="none"
        value={sliderValue}
      >
        <Slider.Label className="sr-only">Coverage amount range</Slider.Label>
        <Slider.Control className="flex w-full touch-none items-center py-3 select-none">
          <Slider.Track className="relative h-1.5 w-full rounded-full bg-slate-200">
            <Slider.Indicator className="rounded-full bg-[#397267]" />
            <Slider.Thumb
              aria-label="Minimum coverage"
              aria-valuetext={currencyFormatter.format(draftRange[0])}
              className="size-5 rounded-full border-2 border-[#397267] bg-white shadow-md transition-transform hover:scale-110 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#397267] motion-reduce:transition-none"
              index={0}
            />
            <Slider.Thumb
              aria-label="Maximum coverage"
              aria-valuetext={currencyFormatter.format(draftRange[1])}
              className="size-5 rounded-full border-2 border-[#397267] bg-white shadow-md transition-transform hover:scale-110 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#397267] motion-reduce:transition-none"
              index={1}
            />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>

      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <CoverageInput
          label="Minimum"
          maximum={rangeMaximum}
          onChange={(value) =>
            setDraftRange([Math.min(value, draftRange[1]), draftRange[1]])
          }
          onCommit={() => commitRange()}
          value={draftRange[0]}
        />
        <CoverageInput
          label="Maximum"
          maximum={rangeMaximum}
          onChange={(value) =>
            setDraftRange([draftRange[0], Math.max(value, draftRange[0])])
          }
          onCommit={() => commitRange()}
          value={draftRange[1]}
        />
      </div>
      <AppText className="mt-3" tone="muted" variant="caption">
        The slider uses a graduated scale so standard benefits and large
        outliers remain adjustable.
      </AppText>
    </section>
  )
}

export type QueueExtendedFiltersProps = {
  product: string
  priority: string
  submitted: SubmissionDateFilter
  completeness: SubmissionCompletenessFilter
  coverageMinDollars: number
  coverageMaxDollars: number | null
  coverageRangeMaximum: number
  products: string[]
  priorities: string[]
  hasActiveFilters: boolean
  onProductChange: (value: string) => void
  onPriorityChange: (value: string) => void
  onSubmittedChange: (value: SubmissionDateFilter) => void
  onCompletenessChange: (value: SubmissionCompletenessFilter) => void
  onCoverageRangeChange: (minimum: number, maximum: number | null) => void
  onReset: () => void
}

export function QueueExtendedFilters({
  product,
  priority,
  submitted,
  completeness,
  coverageMinDollars,
  coverageMaxDollars,
  coverageRangeMaximum,
  products,
  priorities,
  hasActiveFilters,
  onProductChange,
  onPriorityChange,
  onSubmittedChange,
  onCompletenessChange,
  onCoverageRangeChange,
  onReset,
}: QueueExtendedFiltersProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <CoverageRangeFilter
        key={`${coverageMinDollars}-${coverageMaxDollars ?? "maximum"}-${coverageRangeMaximum}`}
        maximum={coverageMaxDollars}
        minimum={coverageMinDollars}
        onChange={onCoverageRangeChange}
        rangeMaximum={coverageRangeMaximum}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
        <AppSelect
          label="Product"
          onValueChange={onProductChange}
          options={[
            { label: "All products", value: "" },
            ...products.map((item) => ({ label: item, value: item })),
          ]}
          value={product}
        />
        <AppSelect
          label="Priority"
          onValueChange={onPriorityChange}
          options={[
            { label: "All priorities", value: "" },
            ...priorities.map((item) => ({
              label: item.charAt(0) + item.slice(1).toLocaleLowerCase("en-US"),
              value: item,
            })),
          ]}
          value={priority}
        />
        <AppSelect<SubmissionDateFilter>
          label="Submitted date"
          onValueChange={onSubmittedChange}
          options={[
            { label: "Any submitted date", value: "" },
            { label: "Date available", value: "with_date" },
            { label: "Date missing", value: "missing_date" },
          ]}
          value={submitted}
        />
        <AppSelect<SubmissionCompletenessFilter>
          label="Record completeness"
          onValueChange={onCompletenessChange}
          options={[
            { label: "Any completeness", value: "" },
            { label: "Complete records", value: "complete" },
            { label: "Missing information", value: "missing" },
          ]}
          value={completeness}
        />
      </div>

      <div className="flex justify-end lg:col-span-2">
        <button
          className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-white hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40"
          disabled={!hasActiveFilters}
          onClick={onReset}
          type="button"
        >
          <RotateCcw aria-hidden="true" className="size-3.5" />
          Clear extended filters
        </button>
      </div>
    </div>
  )
}
