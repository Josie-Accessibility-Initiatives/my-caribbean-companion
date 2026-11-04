import type { JobListing } from '@/lib/external/jsearch'

export type JobLink = {
  name: string
  url: string
  description: string
  categories: string[]
}

export type JobLinksData = {
  caribbean_wide: JobLink[]
  by_country: Record<string, JobLink[]>
  by_profession: Record<string, Omit<JobLink, 'categories'>[]>
}

export type CuratedJobLinks = {
  countryLinks: JobLink[]
  professionLinks: Omit<JobLink, 'categories'>[]
  caribbeanWideLinks: JobLink[]
}

/** Response body of GET /api/jobs */
export type JobsApiResponse = {
  country: { code: string; name: string }
  profession: string
  page: number
  listings: {
    jobs: JobListing[]
    total: number
    source: 'jsearch' | 'cache' | 'empty'
    searchedAt: string
  }
  curatedLinks: CuratedJobLinks
  hasLiveListings: boolean
  message: string | null
}

export function getJobLinksForContext(
  countryCode: string,
  profession: string
): CuratedJobLinks {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const data = require('@/data/job-links.json') as JobLinksData

  return {
    countryLinks: data.by_country[countryCode] ?? [],
    professionLinks: data.by_profession[profession] ?? [],
    caribbeanWideLinks: data.caribbean_wide,
  }
}
