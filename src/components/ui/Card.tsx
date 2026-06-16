import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("bg-[var(--color-surface-card)] text-[var(--color-ink)] rounded-none p-6 border border-[var(--color-hairline)]", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

export { Card }
