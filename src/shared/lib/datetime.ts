/**
 * Date/time display helpers.
 *
 * API timestamps are ISO-8601 UTC (e.g. `2026-07-08T09:00:00Z`). We parse them
 * with date-fns `parseISO` (offset-aware, so a trailing `Z` is read as UTC) and
 * render with `format`, which emits in the viewer's *local* timezone. Formatting
 * style (`yyyy/MM/dd HH:mm`) mirrors mvmnt-user-dashboard's `shared/lib/datetime`.
 */
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  format,
  parseISO,
} from 'date-fns'

/** Guard against `Invalid Date`, which throws inside date-fns `format`. */
function safeParse(iso: string): Date | null {
  if (!iso) return null
  const date = parseISO(iso)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Compact relative time from an ISO-8601 UTC string, e.g. `"3h ago"`. */
export function formatRelativeTime(iso: string): string {
  const date = safeParse(iso)
  if (!date) return ''
  const now = new Date()

  const seconds = differenceInSeconds(now, date)
  if (seconds < 45) return 'just now'

  const minutes = differenceInMinutes(now, date)
  if (minutes < 60) return `${minutes}m ago`

  const hours = differenceInHours(now, date)
  if (hours < 24) return `${hours}h ago`

  const days = differenceInDays(now, date)
  if (days < 7) return `${days}d ago`

  // Older than a week — fall back to the absolute date.
  return formatDate(iso)
}

/** Absolute date + time in the viewer's local timezone, e.g. `"2026/07/08 14:30"`. */
export function formatDateTime(iso: string): string {
  const date = safeParse(iso)
  return date ? format(date, 'yyyy/MM/dd HH:mm') : ''
}

/** Absolute date in the viewer's local timezone, e.g. `"2026/07/08"`. */
export function formatDate(iso: string): string {
  const date = safeParse(iso)
  return date ? format(date, 'yyyy/MM/dd') : ''
}
