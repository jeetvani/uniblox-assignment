import type { PropsWithChildren, ReactNode } from "react"

import { AppText, AppView } from "@/components/ui/primary"
import { cn } from "@/lib/utils"

type WorkbenchLayoutProps = PropsWithChildren<{
  toolbar?: ReactNode
  headerActions?: ReactNode
  className?: string
}>

export function WorkbenchLayout({
  children,
  toolbar,
  headerActions,
  className,
}: WorkbenchLayoutProps) {
  return (
    <AppView className="h-dvh overflow-hidden bg-[#f1f3f0] text-foreground">
      <a
        className="fixed top-3 left-3 z-50 -translate-y-20 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-transform focus:translate-y-0"
        href="#main-content"
      >
        Skip to review queue
      </a>

      <main
        className={cn(
          "mx-auto flex h-full w-[calc(100%-1rem)] max-w-[1680px] flex-col overflow-hidden py-3 sm:w-[calc(100%-2rem)] sm:py-5 lg:w-[90%] lg:py-8 [@media(max-height:500px)]:py-2",
          className,
        )}
        id="main-content"
      >
        <section
          aria-labelledby="workbench-title"
          className="mb-3 flex shrink-0 flex-col gap-2 border-b border-slate-900/10 pb-3 md:mb-4 md:flex-row md:items-center md:justify-between md:gap-4 md:pb-4 [@media(max-height:500px)]:mb-2 [@media(max-height:500px)]:pb-2"
        >
          <AppView className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-8 lg:gap-10">
            <AppView className="flex shrink-0 items-center gap-2.5 md:gap-3.5">
              <AppView
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/90 bg-white/80 shadow-[0_8px_22px_rgba(52,47,110,0.1)] md:size-13 md:rounded-2xl"
              >
                <img
                  alt=""
                  className="h-6 w-auto md:h-8"
                  src="/uniblox-logo.svg"
                />
              </AppView>
              <AppView>
                <AppText
                  as="p"
                  className="text-sm font-semibold tracking-[-0.01em] text-slate-950 sm:text-base md:text-lg"
                  variant="label"
                >
                  UniBlox Review
                </AppText>
                <AppText
                  className="mt-0.5 text-[10px] md:text-xs"
                  variant="eyebrow"
                >
                  Review queue
                </AppText>
              </AppView>
            </AppView>

            <AppView className="min-w-0 md:border-l md:border-slate-900/10 md:pl-8 lg:pl-10">
              <AppText
                as="h1"
                className="text-xl tracking-[-0.025em] sm:text-2xl md:text-[clamp(1.8rem,3vw,2.65rem)]"
                id="workbench-title"
                variant="pageTitle"
              >
                Enrollment review workbench
              </AppText>
              <AppText
                className="mt-1 hidden max-w-3xl md:block [@media(max-height:500px)]:hidden"
                variant="body"
              >
                Investigate flagged enrollment submissions, resolve
                discrepancies, and keep coverage decisions moving.
              </AppText>
            </AppView>
          </AppView>

          {headerActions}
        </section>

        {toolbar ? (
          <section
            aria-label="Queue controls"
            className="mb-2 shrink-0 sm:mb-3 xl:mb-4"
          >
            {toolbar}
          </section>
        ) : null}

        <AppView className="flex min-h-0 flex-1 flex-col">{children}</AppView>
      </main>
    </AppView>
  )
}
