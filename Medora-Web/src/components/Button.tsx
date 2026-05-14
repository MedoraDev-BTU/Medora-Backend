import type { ButtonHTMLAttributes, ReactNode } from "react"

type Variant = "primary" | "secondary" | "danger" | "ghost"

const variants: Record<Variant, string> = {
  primary: "bg-cyan-600 text-white shadow-sm shadow-cyan-900/10 hover:bg-cyan-700",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:bg-cyan-50",
  danger: "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
  ghost: "text-slate-600 hover:bg-slate-100",
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  icon?: ReactNode
}

export default function Button({
  className = "",
  icon,
  children,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
