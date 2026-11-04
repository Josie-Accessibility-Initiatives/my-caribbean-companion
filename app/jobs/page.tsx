'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import BackButton from '@/components/ui/BackButton'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { ErrorCard } from '@/components/ui/ErrorCard'
import { Select } from '@/components/ui/Select'
import JobCard from '@/components/jobs/JobCard'
import CuratedJobLinks from '@/components/jobs/CuratedJobLinks'
import { COUNTRY_META } from '@/data/countryMeta'
import { COUNTRY_OPTIONS } from '@/lib/options'
import { errorMessage, fetchJson } from '@/lib/fetch-json'
import type { JobsApiResponse } from '@/lib/types/jobs'

const PAGE_SIZE = 10

// JSearch query terms: the CSME categories plus a few common professions.
const PROFESSION_OPTIONS = [
  'Agricultural Worker',
  'Artisan',
  'Artiste',
  'Domestic Worker',
  'Holder of Associate Degree',
  'Media Worker',
  'Musician',
  'Nurse',
  'Private Security Officer',
  'Sportsperson',
  'Teacher',
  'University Graduate',
  'Engineer',
  'IT Professional',
  'Accountant',
].map((p) => ({ value: p, label: p }))

const SOURCE_BADGE: Record<JobsApiResponse['listings']['source'], { label: string; dot: string }> = {
  jsearch: { label: 'Live listings', dot: '#22c55e' },
  cache: { label: 'Cached results', dot: '#9ca3af' },
  empty: { label: 'Browse boards below', dot: '#f59e0b' },
}

function JobsEmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill="var(--color-primary-soft)" />
      <path
        d="M16 32V20a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12M20 18v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        stroke="var(--color-primary)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M20 24h8M20 28h5" stroke="var(--color-primary)" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function JobResults({
  result,
  page,
  userProfession,
  onPage,
}: {
  result: JobsApiResponse
  page: number
  userProfession: string
  onPage: (page: number) => void
}) {
  const { listings } = result
  const badge = SOURCE_BADGE[listings.source] ?? SOURCE_BADGE.empty
  const totalPages = Math.ceil(listings.total / PAGE_SIZE)

  return (
    <div className="stack">
      <div className="row-between">
        <p className="job-results-heading">
          {listings.total > 0
            ? `${listings.total} job${listings.total === 1 ? '' : 's'} found for `
            : 'No live listings for '}
          <span className="text-primary">{result.profession}</span>
          {' in '}
          <span className="text-primary">{result.country.name}</span>
        </p>
        <Badge className="badge--outline">
          <span className="dot" style={{ background: badge.dot }} />
          {badge.label}
        </Badge>
      </div>

      {result.message && <p className="text-sm text-muted no-margin">{result.message}</p>}

      {listings.jobs.map((job) => (
        <JobCard key={job.jobId} job={job} userProfession={userProfession} />
      ))}

      {totalPages > 1 && (
        <div className="row-between">
          <button type="button" className="btn-secondary" onClick={() => onPage(page - 1)} disabled={page <= 1}>
            ← Previous
          </button>
          <span className="text-sm text-muted">Page {page}</span>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next →
          </button>
        </div>
      )}

      <CuratedJobLinks
        {...result.curatedLinks}
        countryName={result.country.name}
        profession={result.profession}
      />
    </div>
  )
}

export default function JobsPage() {
  const searchParams = useSearchParams()
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedProfession, setSelectedProfession] = useState('')
  const [result, setResult] = useState<JobsApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  // Pre-fill country from ?country= URL param
  useEffect(() => {
    const urlCountry = searchParams.get('country')
    if (urlCountry && COUNTRY_META[urlCountry]) setSelectedCountry(urlCountry)
  }, [searchParams])

  const doSearch = useCallback(async (country: string, profession: string, pg: number) => {
    if (!country || !profession) return
    setLoading(true)
    setError(null)
    try {
      setResult(
        await fetchJson<JobsApiResponse>(
          `/api/jobs?country=${encodeURIComponent(country)}&profession=${encodeURIComponent(profession)}&page=${pg}`,
          undefined,
          'Failed to load jobs'
        )
      )
    } catch (e) {
      setError(errorMessage(e, 'Failed to load jobs'))
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = () => {
    setPage(1)
    setResult(null)
    doSearch(selectedCountry, selectedProfession, 1)
  }

  const handlePage = (next: number) => {
    setPage(next)
    doSearch(selectedCountry, selectedProfession, next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="page-container page-container--wide">
      <div className="page-header">
        <BackButton />
        <h1 className="section-title">Caribbean Job Board</h1>
        <p className="page-intro">
          Find job opportunities across CARICOM member states. Live listings updated
          regularly from regional sources.
        </p>
      </div>

      <div className="two-column">
        <div className="planner-card">
          <h2 className="card-heading">Search Jobs</h2>
          <Select
            label="Destination country"
            value={selectedCountry}
            onChange={setSelectedCountry}
            options={COUNTRY_OPTIONS}
            placeholder="Select a country…"
          />
          <Select
            label="Your profession"
            value={selectedProfession}
            onChange={setSelectedProfession}
            options={PROFESSION_OPTIONS}
            placeholder="Select a profession…"
          />
          <button
            type="button"
            className="btn-primary full-width"
            onClick={handleSearch}
            disabled={loading || !selectedCountry || !selectedProfession}
          >
            {loading ? 'Searching…' : 'Find Jobs'}
          </button>
        </div>

        <div>
          {loading && (
            <div className="stack">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {!loading && error && (
            <ErrorCard
              message="Unable to load job listings."
              onRetry={() => doSearch(selectedCountry, selectedProfession, page)}
            />
          )}

          {!loading && !error && !result && (
            <div className="empty-state">
              <JobsEmptyIcon />
              <p>Select a country and profession to see available opportunities.</p>
            </div>
          )}

          {!loading && !error && result && (
            <JobResults
              result={result}
              page={page}
              userProfession={selectedProfession}
              onPage={handlePage}
            />
          )}
        </div>
      </div>
    </div>
  )
}
