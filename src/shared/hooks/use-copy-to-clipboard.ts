'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Copy-to-clipboard with a transient `copied` flag that auto-resets after
 * `resetMs` (default ~1.5s). `copy` resolves to `true`/`false` so callers can
 * react to clipboard failures (e.g. permission blocked) if they want to.
 */
export function useCopyToClipboard(resetMs = 1500) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), resetMs)
        return true
      } catch {
        return false
      }
    },
    [resetMs],
  )

  return { copied, copy }
}
