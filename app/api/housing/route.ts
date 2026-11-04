import { NextRequest, NextResponse } from 'next/server'
import { searchHousing } from '@/lib/external/housing-search'
import { COUNTRY_META } from '@/data/countryMeta'
import { handleRouteError, requireCountryParam } from '@/lib/api'
import housingLinks from '@/data/housing-links.json'

export async function GET(req: NextRequest) {
  try {
    const country = requireCountryParam(new URL(req.url).searchParams)
    const meta = COUNTRY_META[country]
    const staticData =
      housingLinks.by_country[country as keyof typeof housingLinks.by_country]
    const live = await searchHousing(country)

    return NextResponse.json({
      country: {
        code: country,
        name: meta.name,
        capital: meta.stats.capital,
        searchCity: meta.stats.searchCity,
      },
      liveData: {
        averageRentOneBed: live.averageRentOneBed ?? staticData?.averageRent.oneBed,
        averageRentTwoBed: live.averageRentTwoBed ?? staticData?.averageRent.twoBed,
        temporaryOptions: live.temporaryOptions,
        tips: live.tips,
        source: live.source,
        searchedAt: live.searchedAt,
      },
      staticData: {
        averageRent: staticData?.averageRent ?? null,
        neighborhoods: staticData?.neighborhoods ?? [],
        facebookGroups: staticData?.facebookGroups ?? [],
        realEstateLinks: staticData?.realEstateLinks ?? [],
        bookingComUrl: staticData?.bookingComUrl ?? null,
      },
      regional: housingLinks.regional,
    })
  } catch (err) {
    return handleRouteError(err, 'GET /api/housing', 'Failed to load housing data.')
  }
}
