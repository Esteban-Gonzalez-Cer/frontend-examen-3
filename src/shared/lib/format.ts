const numberFmt = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 })
const dateFmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' })

export function formatNumber(value: number | null | undefined, empty = '—'): string {
  return value === null || value === undefined || Number.isNaN(value) ? empty : numberFmt.format(value)
}

export function formatPct(value: number | null | undefined, empty = '—'): string {
  return value === null || value === undefined ? empty : `${numberFmt.format(value)}%`
}

export function formatDateTime(iso: string): string {
  return dateFmt.format(new Date(iso))
}

const MINOR_WORDS = new Set(['a', 'al', 'con', 'de', 'del', 'e', 'el', 'en', 'la', 'las', 'los', 'o', 'para', 'por', 'u', 'y'])
const ROMAN = /^(i|ii|iii|iv|v|vi)$/

/** "TALLER DE INVESTIGACIÓN II" → "Taller de Investigación II" */
export function toTitleCase(text: string): string {
  return text
    .toLocaleLowerCase('es-MX')
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => {
      if (ROMAN.test(word)) return word.toUpperCase()
      if (index > 0 && MINOR_WORDS.has(word)) return word
      return word.charAt(0).toLocaleUpperCase('es-MX') + word.slice(1)
    })
    .join(' ')
}

export function firstName(fullName: string): string {
  return toTitleCase(fullName).split(' ')[0] ?? ''
}

export function initials(fullName: string): string {
  return toTitleCase(fullName)
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
}

/** Accent/case-insensitive normalisation for search boxes. */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
