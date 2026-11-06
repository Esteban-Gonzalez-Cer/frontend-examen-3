import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

import { IconButton } from './Button'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

export function Dialog({ open, onClose, title, children, footer }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      // showModal() focuses the first focusable element (the close button); prefer the first field.
      dialog.querySelector<HTMLElement>('[data-autofocus], input:not([disabled]), select, textarea')?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      className="m-auto w-[min(520px,calc(100vw-32px))] rounded-[var(--radius-card)] border-0 bg-[#f8f5f8] p-0 text-ink shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
    >
      {open ? (
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id={titleId} className="text-2xl font-light">
              {title}
            </h2>
            <IconButton label="Cerrar" size="sm" onClick={onClose}>
              <X className="size-4" aria-hidden />
            </IconButton>
          </div>
          {children}
          {footer ? <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div> : null}
        </div>
      ) : null}
    </dialog>
  )
}
