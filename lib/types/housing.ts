export type FacebookGroup = {
  name: string
  url: string
  description: string
  members: string
}

export type RealEstateLink = {
  name: string
  url: string
  description: string
}

export type RentRange = {
  min: number
  max: number
}

export type AverageRent = {
  studio: RentRange
  oneBed: RentRange
  twoBed: RentRange
  currency: string
  note: string
}

export type Neighborhood = {
  name: string
  description: string
  priceRange: 'budget' | 'mid' | 'mid-high' | 'high'
}

export type CountryHousingData = {
  facebookGroups: FacebookGroup[]
  realEstateLinks: RealEstateLink[]
  bookingComUrl: string
  averageRent: AverageRent
  neighborhoods: Neighborhood[]
}

export type RegionalLink = {
  name: string
  url: string
  description: string
  type: 'real_estate' | 'temporary'
  icon: string
}

export type HousingLinksData = {
  regional: RegionalLink[]
  by_country: Record<string, CountryHousingData>
}

export type TemporaryOption = {
  name: string
  pricePerNight: number | null
  url: string
  type: string
}

type NullableRange = { min: number | null; max: number | null }

/** Response body of GET /api/housing */
export type HousingApiResponse = {
  country: { code: string; name: string; capital: string; searchCity: string }
  liveData: {
    averageRentOneBed: NullableRange | null
    averageRentTwoBed: NullableRange | null
    temporaryOptions: TemporaryOption[]
    tips: string[]
    source: 'tavily' | 'fallback'
    searchedAt: string
  }
  staticData: {
    averageRent: AverageRent | null
    neighborhoods: Neighborhood[]
    facebookGroups: FacebookGroup[]
    realEstateLinks: RealEstateLink[]
    bookingComUrl: string | null
  }
  regional: RegionalLink[]
}

/** Prefer a complete live rent range, otherwise fall back to the static one. */
export function resolveRentRange(
  live: NullableRange | null | undefined,
  fallback: RentRange | null | undefined
): RentRange | null {
  if (live?.min != null && live?.max != null) return { min: live.min, max: live.max }
  return fallback ?? null
}
