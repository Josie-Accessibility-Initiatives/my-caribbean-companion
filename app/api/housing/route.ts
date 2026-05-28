import { NextRequest, NextResponse } from 'next/server'
import { searchHousing } from '@/lib/external/housing-search'
import { COUNTRY_META } from '@/data/countryMeta'
import housingLinks from '@/data/housing-links.json'

export async function GET(req: NextRequest) {
  const country =
    new URL(req.url).searchParams.get('country')

  if (!country) {
    return NextResponse.json(
      { error: 'country parameter required' },
      { status: 400 }
    )
  }

  if (!COUNTRY_META[country]) {
    return NextResponse.json(
      { error: 'Invalid country code' },
      { status: 400 }
    )
  }

  const meta = COUNTRY_META[country]
  const countryHousingData =
    housingLinks.by_country[country as keyof typeof housingLinks.by_country]

  const [tavilyData] = await Promise.all([
    searchHousing(country)
  ])

  return NextResponse.json({
    country: {
      code: country,
      name: meta.name,
      capital: meta.stats.capital,
      searchCity: meta.stats.searchCity
    },
    liveData: {
      averageRentOneBed:
        tavilyData.averageRentOneBed ??
        countryHousingData?.averageRent.oneBed,
      averageRentTwoBed:
        tavilyData.averageRentTwoBed ??
        countryHousingData?.averageRent.twoBed,
      temporaryOptions: tavilyData.temporaryOptions,
      tips: tavilyData.tips,
      source: tavilyData.source,
      searchedAt: tavilyData.searchedAt
    },
    staticData: {
      averageRent: countryHousingData?.averageRent ?? null,
      neighborhoods: countryHousingData?.neighborhoods ?? [],
      facebookGroups: countryHousingData?.facebookGroups ?? [],
      realEstateLinks: countryHousingData?.realEstateLinks ?? [],
      bookingComUrl: countryHousingData?.bookingComUrl ?? null
    },
    regional: housingLinks.regional
  })
}
