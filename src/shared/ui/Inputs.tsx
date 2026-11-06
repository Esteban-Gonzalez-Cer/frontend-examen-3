import { Search } from 'lucide-react'
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
}

export function SearchInput({ value, onChange, placeholder = 'Buscar…', label = 'Buscar', className }: SearchInputProps) {
  return (
    <label className={cn('flex h-11 items-center gap-2 rounded-full bg-white/75 px-4 ring-1 ring-ink/10 focus-within:ring-ink/40', className)}>
      <Search className="size-4 text-muted" aria-hidden />
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted"
      />
    </label>
  )
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: ReactNode
  trailing?: ReactNode
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, icon, trailing, className, id, ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  const errorId = `${inputId}-error`
  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 block text-sm text-ink/80">
        {label}
      </label>
      <div
        className={cn(
          'flex h-12 items-center gap-2 rounded-2xl bg-white/80 px-4 ring-1 transition focus-within:ring-2',
          error ? 'ring-risk/60 focus-within:ring-risk' : 'ring-ink/10 focus-within:ring-ink/50',
        )}
      >
        {icon ? <span className="text-muted">{icon}</span> : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted"
          {...rest}
        />
        {trailing}
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-risk">
          {error}
        </p>
      ) : null}
    </div>
  )
})

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  children: ReactNode
}

export function SelectField({ label, className, id, children, ...rest }: SelectFieldProps) {
  const autoId = useId()
  const selectId = id ?? autoId
  return (
    <div className={className}>
      <label htmlFor={selectId} className="mb-1.5 block text-sm text-ink/80">
        {label}
      </label>
      <select
        id={selectId}
        className="h-11 w-full rounded-2xl bg-white/80 px-3 text-[15px] ring-1 ring-ink/10 outline-none focus:ring-2 focus:ring-ink/50"
        {...rest}
      >
        {children}
      </select>
    </div>
  )
}

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span>
        <span className="block text-[15px]">{label}</span>
        {description ? <span className="block text-xs text-muted">{description}</span> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn('relative h-7 w-12 shrink-0 rounded-full transition', checked ? 'bg-ink' : 'bg-ink/15')}
      >
        <span
          className={cn(
            'absolute top-1 size-5 rounded-full transition-all',
            checked ? 'left-6 bg-accent' : 'left-1 bg-white',
          )}
        />
      </button>
    </label>
  )
}

export interface SegmentedOption<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  size?: 'sm' | 'md'
}

export function SegmentedControl<T extends string>({ options, value, onChange, label, size = 'md' }: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full bg-white/70 p-1 ring-1 ring-ink/10">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-full transition whitespace-nowrap',
              size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm',
              active ? 'bg-ink text-white' : 'text-ink/80 hover:bg-white',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
