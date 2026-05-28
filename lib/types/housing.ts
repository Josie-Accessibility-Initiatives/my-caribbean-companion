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
