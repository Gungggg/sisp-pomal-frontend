import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "secondaryOnDark" | "textLink"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    let variantClasses = ""
    switch (variant) {
      case "primary":
        variantClasses = "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-active)] rounded-none px-8 py-3.5 h-12 font-bold tracking-[0.5px] uppercase text-[14px]"
        break
      case "secondary":
        variantClasses = "bg-[var(--color-canvas)] text-[var(--color-ink)] border border-[var(--color-hairline-strong)] rounded-none px-8 py-3.5 h-12 font-bold tracking-[0.5px] uppercase text-[14px]"
        break
      case "secondaryOnDark":
        variantClasses = "bg-transparent text-[var(--color-on-dark)] border border-[var(--color-on-dark)] rounded-none px-8 py-3.5 h-12 font-bold tracking-[0.5px] uppercase text-[14px] hover:bg-white/10"
        break
      case "textLink":
        variantClasses = "bg-transparent text-[var(--color-ink)] p-0 font-bold tracking-[1.5px] uppercase text-[13px] inline-flex items-center gap-1 hover:text-[var(--color-primary)]"
        break
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantClasses,
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
