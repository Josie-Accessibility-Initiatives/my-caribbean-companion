import { getCached, setCached } from '@/lib/cache'

const CACHE_TTL_HOURS = 24 * 14 // 14 days
const RAPIDAPI_HOST = 'jsearch.p.rapidapi.com'

export type JobListing = {
  jobId: string
  title: string
  company: string
  location: string
  country: string
  countryCode: string
  employmentType: string | null
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string | null
  description: string
  applyLink: string
  postedAt: string | null
  logo: string | null
  isRemote: boolean
  source: 'jsearch'
}

export type JobSearchResult = {
  jobs: JobListing[]
  total: number
  query: string
  countryCode: string
  profession: string
  source: 'jsearch' | 'cache' | 'empty'
  searchedAt: string
}

const JSEARCH_COUNTRY_NAMES: Record<string, string> = {
  TT: 'Trinidad and Tobago',
  BB: 'Barbados',
  JM: 'Jamaica',
  GY: 'Guyana',
  LC: 'Saint Lucia',
  GD: 'Grenada',
  DM: 'Dominica',
  VC: 'Saint Vincent and the Grenadines',
  KN: 'Saint Kitts and Nevis',
  AG: 'Antigua and Barbuda',
  SR: 'Suriname',
  BZ: 'Belize',
}

export async function searchJobs(
  countryCode: string,
  profession: string,
  page: number = 1
): Promise<JobSearchResult> {
  const cacheKey =
    `jobs:jsearch:${countryCode}:` +
    `${profession.toLowerCase().replace(/\s/g, '_')}` +
    `:page${page}`

  const cached = await getCached<JobSearchResult>(cacheKey)
  if (cached) return { ...cached, source: 'cache' }

  const countryName = JSEARCH_COUNTRY_NAMES[countryCode]
  if (!countryName) {
    return emptyResult(countryCode, profession)
  }

  try {
    const query = `${profession} jobs in ${countryName}`

    const url = new URL('https://jsearch.p.rapidapi.com/search')
    url.searchParams.set('query', query)
    url.searchParams.set('page', String(page))
    url.searchParams.set('num_pages', '1')
    url.searchParams.set('date_posted', 'month')

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
      },
    })

    if (!response.ok) {
      console.error('JSearch error:', response.status)
      return emptyResult(countryCode, profession)
    }

    const data = await response.json()
    const rawJobs = data.data ?? []

    const jobs: JobListing[] = rawJobs.map(
      (j: Record<string, unknown>) => ({
        jobId: String(j.job_id ?? ''),
        title: String(j.job_title ?? ''),
        company: String(j.employer_name ?? 'Unknown Company'),
        location: [j.job_city, j.job_state, j.job_country]
          .filter(Boolean)
          .join(', '),
        country: countryName,
        countryCode,
        employmentType: j.job_employment_type
          ? String(j.job_employment_type)
          : null,
        salaryMin: j.job_min_salary ? Number(j.job_min_salary) : null,
        salaryMax: j.job_max_salary ? Number(j.job_max_salary) : null,
        salaryCurrency: j.job_salary_currency
          ? String(j.job_salary_currency)
          : null,
        description: String(j.job_description ?? '').slice(0, 500),
        applyLink: String(j.job_apply_link ?? j.job_google_link ?? ''),
        postedAt: j.job_posted_at_datetime_utc
          ? String(j.job_posted_at_datetime_utc)
          : null,
        logo: j.employer_logo ? String(j.employer_logo) : null,
        isRemote: Boolean(j.job_is_remote),
        source: 'jsearch' as const,
      })
    )

    const result: JobSearchResult = {
      jobs,
      total: jobs.length,
      query,
      countryCode,
      profession,
      source: 'jsearch',
      searchedAt: new Date().toISOString(),
    }

    if (jobs.length > 0) {
      await setCached(cacheKey, result, CACHE_TTL_HOURS)
    }

    return result
  } catch (error) {
    console.error('JSearch fetch error:', error)
    return emptyResult(countryCode, profession)
  }
}

function emptyResult(
  countryCode: string,
  profession: string
): JobSearchResult {
  return {
    jobs: [],
    total: 0,
    query: '',
    countryCode,
    profession,
    source: 'empty',
    searchedAt: new Date().toISOString(),
  }
}
