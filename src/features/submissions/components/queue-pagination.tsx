import { ChevronLeft, ChevronRight } from "lucide-react"
import { useLayoutEffect, useRef, useState } from "react"

import { AppText } from "@/components/ui/primary"

type QueuePaginationProps = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function QueuePagination({
  page,
  pageSize,
  total,
  onPageChange,
}: QueuePaginationProps) {
  const dockRef = useRef<HTMLElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
    docked: false,
    ready: false,
  })
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  useLayoutEffect(() => {
    const dock = dockRef.current
    const pill = pillRef.current
    if (!dock || !pill) return

    const updatePosition = () => {
      frameRef.current = null
      if (window.getComputedStyle(pill).display === "none") {
        setPosition((current) => ({ ...current, ready: false }))
        return
      }
      const dockRect = dock.getBoundingClientRect()
      const pillWidth = pill.offsetWidth
      const pillHeight = pill.offsetHeight
      const docked = dockRect.top <= window.innerHeight - 16
      const x = docked
        ? dockRect.left + dockRect.width / 2 - pillWidth / 2
        : dockRect.right - pillWidth
      const y = docked
        ? dockRect.top + (dockRect.height - pillHeight) / 2
        : window.innerHeight - pillHeight - 20

      setPosition((current) => {
        if (
          current.ready &&
          current.docked === docked &&
          Math.abs(current.x - x) < 0.5 &&
          Math.abs(current.y - y) < 0.5
        ) {
          return current
        }

        return { x, y, docked, ready: true }
      })
    }

    const schedulePositionUpdate = () => {
      if (frameRef.current !== null) return
      frameRef.current = window.requestAnimationFrame(updatePosition)
    }

    updatePosition()
    window.addEventListener("resize", schedulePositionUpdate)
    window.addEventListener("scroll", schedulePositionUpdate, { passive: true })

    const resizeObserver = new ResizeObserver(schedulePositionUpdate)
    resizeObserver.observe(dock)
    resizeObserver.observe(pill)

    return () => {
      window.removeEventListener("resize", schedulePositionUpdate)
      window.removeEventListener("scroll", schedulePositionUpdate)
      resizeObserver.disconnect()
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [page, total, totalPages])

  return (
    <nav
      aria-label="Submission queue pagination"
      className="mt-2 grid min-h-12 shrink-0 items-center gap-3 xl:mt-4 xl:min-h-14 xl:grid-cols-[1fr_auto_1fr]"
      ref={dockRef}
    >
      <AppText
        className="hidden tabular-nums xl:block xl:text-left"
        variant="caption"
      >
        Showing {first}–{last} of {total}
      </AppText>

      <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-900/8 bg-white/82 p-1.5 pl-3 shadow-[0_8px_24px_rgb(15_23_42/0.08)] backdrop-blur-xl xl:hidden">
        <AppText className="min-w-0 truncate tabular-nums" variant="caption">
          {first}–{last} of {total}
        </AppText>
        <div className="flex shrink-0 items-center gap-1">
          <button
            aria-label="Previous page"
            className="grid size-10 place-items-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-30"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>
          <AppText
            aria-live="polite"
            className="min-w-16 text-center tabular-nums"
            variant="caption"
          >
            {page} / {totalPages}
          </AppText>
          <button
            aria-label="Next page"
            className="grid size-10 place-items-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-30"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            type="button"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>

      <div
        className="fixed top-0 left-0 z-30 hidden items-center justify-center gap-1.5 rounded-full border border-slate-900/10 bg-white/88 p-1.5 shadow-[0_12px_36px_rgb(15_23_42/0.14)] backdrop-blur-xl transition-[transform,opacity,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform xl:flex motion-reduce:transition-none"
        data-docked={position.docked ? "true" : "false"}
        ref={pillRef}
        style={{
          opacity: position.ready ? 1 : 0,
          pointerEvents: position.ready ? "auto" : "none",
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        }}
      >
        <button
          aria-label="Previous page"
          className="grid size-9 place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-35"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          type="button"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </button>
        <AppText
          aria-live="polite"
          className="min-w-24 px-1 text-center tabular-nums"
          variant="caption"
        >
          Page {page} of {totalPages}
        </AppText>
        <button
          aria-label="Next page"
          className="grid size-9 place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-35"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          type="button"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </button>
      </div>

      <div aria-hidden="true" className="hidden sm:block" />
    </nav>
  )
}
