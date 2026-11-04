import { NextRequest, NextResponse } from 'next/server'
import { searchJobs } from '@/lib/external/jsearch'
import { getJobLinksForContext } from '@/lib/types/jobs'
import { COUNTRY_META } from '@/data/countryMeta'
import { ApiError, handleRouteError, requireCountryParam } from '@/lib/api'

function parsePage(value: string | null): number {
  const n = value && /^\d+$/.test(value) ? parseInt(value) : 0
  return n > 0 ? n : 1
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const missing = 'country and profession required'
    const profession = searchParams.get('profession')
    if (!profession) throw new ApiError(missing, 400)
    const country = requireCountryParam(searchParams, missing)
    const page = parsePage(searchParams.get('page'))

    const jobResult = await searchJobs(country, profession, page)
    const countryName = COUNTRY_META[country].name

    return NextResponse.json({
      country: { code: country, name: countryName },
      profession,
      page,
      listings: {
        jobs: jobResult.jobs,
        total: jobResult.total,
        source: jobResult.source,
        searchedAt: jobResult.searchedAt,
      },
      curatedLinks: getJobLinksForContext(country, profession),
      hasLiveListings: jobResult.jobs.length > 0,
      message:
        jobResult.jobs.length === 0
          ? `No live listings found for ${profession} in ${countryName}. Browse the job boards below.`
          : null,
    })
  } catch (err) {
    return handleRouteError(err, 'GET /api/jobs', 'Failed to load jobs.')
  }
}
