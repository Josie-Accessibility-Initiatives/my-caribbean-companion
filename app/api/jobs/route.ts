import { NextRequest, NextResponse } from 'next/server'
import { searchJobs } from '@/lib/external/jsearch'
import { getJobLinksForContext } from '@/lib/types/jobs'
import { COUNTRY_META } from '@/data/countryMeta'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const country = searchParams.get('country')
  const profession = searchParams.get('profession')
  const pageParam = searchParams.get('page')
  const page = pageParam && /^\d+$/.test(pageParam) && parseInt(pageParam) > 0
    ? parseInt(pageParam)
    : 1

  if (!country || !profession) {
    return NextResponse.json(
      { error: 'country and profession required' },
      { status: 400 }
    )
  }

  if (!COUNTRY_META[country]) {
    return NextResponse.json(
      { error: 'Invalid country code' },
      { status: 400 }
    )
  }

  const [jobResult, curatedLinks] = await Promise.all([
    searchJobs(country, profession, page),
    Promise.resolve(getJobLinksForContext(country, profession)),
  ])

  const countryName = COUNTRY_META[country].name

  return NextResponse.json({
    country: {
      code: country,
      name: countryName,
    },
    profession,
    page,
    listings: {
      jobs: jobResult.jobs,
      total: jobResult.total,
      source: jobResult.source,
      searchedAt: jobResult.searchedAt,
    },
    curatedLinks: {
      countryLinks: curatedLinks.countryLinks,
      professionLinks: curatedLinks.professionLinks,
      caribbeanWideLinks: curatedLinks.caribbeanWideLinks,
    },
    hasLiveListings: jobResult.jobs.length > 0,
    message:
      jobResult.jobs.length === 0
        ? `No live listings found for ${profession} in ${countryName}. Browse the job boards below.`
        : null,
  })
}
