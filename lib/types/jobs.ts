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

export function getJobLinksForContext(
  countryCode: string,
  profession: string
): {
  countryLinks: JobLink[]
  professionLinks: Omit<JobLink, 'categories'>[]
  caribbeanWideLinks: JobLink[]
} {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const data = require('@/data/job-links.json') as JobLinksData

  return {
    countryLinks: data.by_country[countryCode] ?? [],
    professionLinks: data.by_profession[profession] ?? [],
    caribbeanWideLinks: data.caribbean_wide,
  }
}
