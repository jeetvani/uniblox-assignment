import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react"

import { cn } from "@/lib/utils"

const appViewVariants = cva("", {
  variants: {
    surface: {
      transparent: "",
      panel:
        "rounded-xl border border-slate-900/10 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)]",
      subtle: "rounded-xl border border-slate-900/10 bg-white/55",
      inset: "rounded-xl border border-slate-900/10 bg-slate-100/70",
    },
  },
  defaultVariants: {
    surface: "transparent",
  },
})

type AppViewOwnProps = VariantProps<typeof appViewVariants> & {
  children?: ReactNode
  className?: string
}

export type AppViewProps<T extends ElementType = "div"> = AppViewOwnProps & {
  as?: T
} & Omit<ComponentPropsWithoutRef<T>, keyof AppViewOwnProps | "as">

export function AppView<T extends ElementType = "div">({
  as,
  surface,
  className,
  children,
  ...props
}: AppViewProps<T>) {
  const Component = as ?? "div"

  return (
    <Component
      className={cn(appViewVariants({ surface }), className)}
      {...props}
    >
      {children}
    </Component>
  )
}
