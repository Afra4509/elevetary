'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { XIcon } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  maxWidth?: number
}

export default function Modal({ open, onClose, title, children, footer, maxWidth = 480 }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="nb-overlay"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="nb-modal animate-slide-up" style={{ maxWidth }}>
        {title && (
          <div className="nb-modal-header">
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.1rem', fontWeight: 800 }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="nb-btn nb-btn-secondary nb-btn-icon"
              style={{ padding: '4px', minWidth: '32px', height: '32px' }}
            >
              <XIcon size={16} />
            </button>
          </div>
        )}
        <div className="nb-modal-body">{children}</div>
        {footer && <div className="nb-modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
