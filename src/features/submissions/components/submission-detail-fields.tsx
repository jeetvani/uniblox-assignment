import { AlertCircle } from "lucide-react"
import type { PropsWithChildren, ReactNode } from "react"

import { AppText, AppView } from "@/components/ui/primary"

export function DetailSection({
  title,
  description,
  children,
}: PropsWithChildren<{ title: string; description?: string }>) {
  return (
    <section className="border-b border-slate-900/10 pb-6 last:border-0 last:pb-0">
      <AppText as="h3" variant="sectionTitle">
        {title}
      </AppText>
      {description ? (
        <AppText className="mt-1" tone="muted" variant="caption">
          {description}
        </AppText>
      ) : null}
      <div className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2">{children}</div>
    </section>
  )
}

export function DetailField({
  label,
  value,
  children,
  fullWidth = false,
}: {
  label: string
  value?: ReactNode
  children?: ReactNode
  fullWidth?: boolean
}) {
  const content = children ?? value
  const isMissing = content === null || content === undefined || content === ""

  return (
    <AppView className={fullWidth ? "sm:col-span-2" : undefined}>
      <AppText className="mb-1.5" variant="caption">
        {label}
      </AppText>
      {isMissing ? (
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-200/70 bg-amber-50/70 px-2.5 py-1 text-xs font-medium text-amber-800">
          <AlertCircle aria-hidden="true" className="size-3.5" />
          {label} not provided
        </span>
      ) : typeof content === "string" || typeof content === "number" ? (
        <AppText className="text-slate-800" variant="label">
          {content}
        </AppText>
      ) : (
        content
      )}
    </AppView>
  )
}
