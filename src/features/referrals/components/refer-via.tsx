'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { REFERRAL_CODE, REFERRAL_LINK } from '../data'
import { useReferral } from '../hooks/use-referrals'

/**
 * A single "Refer via" card: a read-only value box and a copy button that flips
 * to a transient "Copied" state. UI-only — the copy uses the clipboard API but
 * there is no backend involved.
 */
function ReferCard({
  label,
  value,
  buttonLabel,
}: {
  label: string
  value: string
  buttonLabel: string
}) {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Clipboard may be unavailable (e.g. insecure context) — ignore for this UI demo.
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Card className="flex flex-col gap-3 p-4">
      <p className="text-xs text-[var(--color-muted)]">{label}</p>
      <div className="truncate rounded-[var(--radius)] bg-[var(--color-surface-2)] px-4 py-3 text-sm text-[var(--color-fg)]">
        {value}
      </div>
      <Button variant="primary" onClick={onCopy} className="w-full">
        {copied ? <Check /> : <Copy />}
        {copied ? 'Copied' : buttonLabel}
      </Button>
    </Card>
  )
}

/** "Refer via" section — Link and Code cards side by side (figma). Real code/link
 * from GET /referrals/me; falls back to the figma placeholders when logged out. */
export function ReferVia() {
  const { data } = useReferral()
  const link = data?.link ?? REFERRAL_LINK
  const code = data?.code ?? REFERRAL_CODE

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-[var(--color-fg)]">Refer via</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <ReferCard label="Link" value={link} buttonLabel="Copy Referral Link" />
        <ReferCard label="Code" value={code} buttonLabel="Copy Referral Code" />
      </div>
    </section>
  )
}
