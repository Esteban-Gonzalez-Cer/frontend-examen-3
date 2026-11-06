import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'

import { cn } from '@/shared/lib/cn'

type Variant = 'dark' | 'light' | 'accent' | 'outline' | 'ghost' | 'danger'

const variants: Record<Variant, string> = {
  dark: 'bg-ink text-white hover:bg-ink-soft',
  light: 'bg-white/80 text-ink hover:bg-white',
  accent: 'bg-accent text-ink hover:bg-accent-strong',
  outline: 'border border-ink/15 bg-transparent text-ink hover:bg-white/60',
  ghost: 'bg-transparent text-ink hover:bg-white/50',
  danger: 'bg-risk text-white hover:brightness-95',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
}

export function Button({ variant = 'dark', size = 'md', icon, className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-normal transition disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' && 'h-9 px-4 text-sm',
        size === 'md' && 'h-11 px-5 text-[15px]',
        size === 'lg' && 'h-13 px-7 text-base',
        variants[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}

interface LinkButtonProps extends LinkProps {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
}

/** A navigation link that looks like a button (avoids nesting <button> inside <a>). */
export function LinkButton({ variant = 'dark', size = 'md', icon, className, children, ...rest }: LinkButtonProps) {
  return (
    <Link
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-normal transition',
        size === 'sm' && 'h-9 px-4 text-sm',
        size === 'md' && 'h-11 px-5 text-[15px]',
        size === 'lg' && 'h-13 px-7 text-base',
        variants[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </Link>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function IconButton({ label, variant = 'light', size = 'md', className, children, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full transition disabled:opacity-50',
        size === 'sm' && 'size-9',
        size === 'md' && 'size-11',
        size === 'lg' && 'size-14',
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
