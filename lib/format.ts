/** Format a USD amount as $1,234 */
export function fmt(n: number): string {
  return `$${Math.round(n).toLocaleString()}`
}

/** Format a USD min–max range as "$1,000 – $2,000 USD" */
export function fmtUsdRange(min: number, max: number): string {
  return `$${Math.round(min).toLocaleString()} – $${Math.round(max).toLocaleString()} USD`
}

/** Format a rent range as "$1,000 – $2,000 USD/month" */
export function fmtRentRange(range: { min: number; max: number }, currency: string): string {
  return `$${range.min.toLocaleString()} – $${range.max.toLocaleString()} ${currency}/month`
}

/** Format a population number as "1.2M" or "350K" */
export function fmtPop(n: number | null): string {
  if (n === null) return '–'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  return `${(n / 1_000).toFixed(0)}K`
}

/** Format a chart tick value with a currency symbol */
export function fmtTick(v: number, sym: string): string {
  if (v >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${sym}${(v / 1_000).toFixed(0)}k`
  return `${sym}${v}`
}

/** Capitalize the first letter of a string */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
