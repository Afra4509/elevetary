'use client'

import { useState, useCallback } from 'react'
import { CheckIcon, CopyIcon } from 'lucide-react'

interface CopyButtonProps {
  text: string
  label?: string
  size?: 'sm' | 'md'
  className?: string
}

export default function CopyButton({ text, label, size = 'md', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [text])

  const iconSize = size === 'sm' ? 12 : 14

  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      className={`nb-btn nb-btn-secondary ${size === 'sm' ? 'nb-btn-sm' : ''} ${className}`}
      style={{
        background: copied ? 'var(--nb-green)' : undefined,
        color: copied ? 'var(--nb-black)' : undefined,
        borderColor: copied ? 'var(--nb-black)' : undefined,
        transition: 'all 0.2s ease',
        minWidth: label ? undefined : (size === 'sm' ? '28px' : '36px'),
        padding: label ? undefined : (size === 'sm' ? '4px' : '8px'),
      }}
    >
      {copied
        ? <CheckIcon size={iconSize} strokeWidth={3} />
        : <CopyIcon size={iconSize} />
      }
      {label && <span>{copied ? 'Copied!' : label}</span>}
    </button>
  )
}
