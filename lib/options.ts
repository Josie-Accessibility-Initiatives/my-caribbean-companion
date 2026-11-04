import { CATEGORIES, COUNTRIES } from '@/lib/constants'
import type { SelectOption } from '@/components/ui/Select'

export const COUNTRY_OPTIONS: SelectOption[] = COUNTRIES.map((c) => ({
  value: c.code,
  label: c.name,
}))

export const CATEGORY_OPTIONS: SelectOption[] = CATEGORIES.map((c) => ({
  value: c.code,
  label: c.label,
}))
