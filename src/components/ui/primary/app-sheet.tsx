import { Dialog } from "@base-ui/react/dialog"
import { X } from "lucide-react"
import type { PropsWithChildren, ReactNode } from "react"

import { AppText } from "./app-text"

type AppSheetProps = PropsWithChildren<{
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenChangeComplete?: (open: boolean) => void
  title: string
  description?: string
  eyebrow?: string
  footer?: ReactNode
}>

export function AppSheet({
  open,
  onOpenChange,
  onOpenChangeComplete,
  title,
  description,
  eyebrow,
  footer,
  children,
}: AppSheetProps) {
  return (
    <Dialog.Root
      onOpenChange={onOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
      open={open}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[2px] transition-opacity duration-300 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup className="fixed inset-y-0 right-0 z-50 flex h-dvh w-full max-w-none flex-col bg-[#f8f9f7] text-foreground shadow-[-24px_0_70px_rgb(15_23_42/0.16)] outline-none transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-ending-style:translate-x-full data-starting-style:translate-x-full sm:max-w-[min(816px,96vw)] sm:border-l sm:border-slate-900/10 motion-reduce:transition-none">
          <header className="relative shrink-0 border-b border-slate-900/10 bg-white px-4 py-4 pr-15 sm:px-7 sm:py-6 sm:pr-20">
            {eyebrow ? (
              <AppText className="mb-1.5" variant="eyebrow">
                {eyebrow}
              </AppText>
            ) : null}
            <Dialog.Title className="text-xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-2xl">
              {title}
            </Dialog.Title>
            {description ? (
              <Dialog.Description className="mt-1.5 text-sm leading-6 text-slate-600">
                {description}
              </Dialog.Description>
            ) : null}
            <Dialog.Close
              aria-label="Close submission details"
              className="absolute top-4 right-4 grid size-10 place-items-center rounded-full border border-slate-900/10 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:top-6 sm:right-7 sm:size-9"
            >
              <X aria-hidden="true" className="size-4" />
            </Dialog.Close>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-7 sm:py-6">
            {children}
          </div>

          {footer ? (
            <footer className="shrink-0 border-t border-slate-900/10 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-7 sm:py-4">
              {footer}
            </footer>
          ) : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
