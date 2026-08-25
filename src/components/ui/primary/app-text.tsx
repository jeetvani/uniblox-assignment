import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react"

import { cn } from "@/lib/utils"

const appTextVariants = cva("m-0", {
  variants: {
    variant: {
      pageTitle:
        "text-[clamp(1.8rem,3vw,2.65rem)] font-semibold tracking-[-0.035em] text-slate-950",
      sectionTitle: "text-lg font-semibold tracking-[-0.015em] text-slate-950",
      eyebrow:
        "text-xs font-semibold tracking-[0.16em] text-[#397267] uppercase",
      body: "text-sm leading-6 text-slate-600 sm:text-[15px]",
      label: "text-sm font-medium text-slate-700",
      caption: "text-xs font-medium text-muted-foreground",
    },
    tone: {
      default: "",
      muted: "text-muted-foreground",
      brand: "text-[#173f3a]",
      danger: "text-destructive",
      inherit: "text-inherit",
    },
    truncate: {
      true: "truncate",
      false: "",
    },
  },
  defaultVariants: {
    variant: "body",
    tone: "default",
    truncate: false,
  },
})

type AppTextOwnProps = VariantProps<typeof appTextVariants> & {
  children: ReactNode
  className?: string
}

export type AppTextProps<T extends ElementType = "p"> = AppTextOwnProps & {
  as?: T
} & Omit<ComponentPropsWithoutRef<T>, keyof AppTextOwnProps | "as">

export function AppText<T extends ElementType = "p">({
  as,
  variant,
  tone,
  truncate,
  className,
  children,
  ...props
}: AppTextProps<T>) {
  const Component = as ?? "p"

  return (
    <Component
      className={cn(appTextVariants({ variant, tone, truncate }), className)}
      {...props}
    >
      {children}
    </Component>
  )
}
