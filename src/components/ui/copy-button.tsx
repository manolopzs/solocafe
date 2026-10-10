'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
      <Icon name={copied ? 'check' : 'copy'} className="mr-2 h-4 w-4" />
      {copied ? 'Copiado' : 'Copiar'}
    </Button>
  )
}
