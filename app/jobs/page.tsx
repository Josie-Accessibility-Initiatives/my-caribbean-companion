'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import BackButton from '@/components/ui/BackButton'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { ErrorCard } from '@/components/ui/ErrorCard'
import { SORTED_COUNTRIES } from '@/lib/constants'
import { COUNTRY_META } from '@/data/countryMeta'
import JobCard from '@/components/jobs/JobCard'
import CuratedJobLinks from '@/components/jobs/CuratedJobLinks'
import type { JobListing } from '@/lib/external/jsearch'
import type { JobLink } from '@/lib/types/jobs'

// ── Types ─────────────────────────────────────────────────────────

type JobsApiResponse = {
  country: { code: string; name: string }
  profession: string
  page: number
  listings: {
    jobs: JobListing[]
    total: number
    source: 'jsearch' | 'cache' | 'empty'
    searchedAt: string
  }
  curatedLinks: {
    countryLinks: JobLink[]
    professionLinks: Omit<JobLink, 'categories'>[]
    caribbeanWideLinks: JobLink[]
  }
  hasLiveListings: boolean
  message: string | null
}

// ── Static data ────────────────────────────────────────────────────

const PROFESSIONS = [
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
]

// ── Source badge ───────────────────────────────────────────────────

const SOURCE_BADGE: Record<string, { label: string; dot: string }> = {
  jsearch: { label: 'Live listings',    dot: '#22c55e' },
  cache:   { label: 'Cached results',   dot: '#9ca3af' },
  empty:   { label: 'Browse boards below', dot: '#f59e0b' },
}

// ── Main page ──────────────────────────────────────────────────────

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
    if (urlCountry && COUNTRY_META[urlCountry]) {
      setSelectedCountry(urlCountry)
    }
  }, [searchParams])

  const doSearch = useCallback(async (country: string, profession: string, pg: number) => {
    if (!country || !profession) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/jobs?country=${encodeURIComponent(country)}&profession=${encodeURIComponent(profession)}&page=${pg}`
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'Failed to load jobs')
      }
      setResult(await res.json() as JobsApiResponse)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load jobs')
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

  const sourceBadge = result ? (SOURCE_BADGE[result.listings.source] ?? SOURCE_BADGE.empty) : null
  const totalPages = result ? Math.ceil(result.listings.total / 10) : 0

  return (
    <>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

        {/* Page header */}
        <div style={{ marginBottom: '2rem' }}>
          <BackButton />
          <h1 className="section-title" style={{ marginBottom: '0.35rem' }}>
            Caribbean Job Board
          </h1>
          <p style={{ color: '#6b7280', margin: 0, maxWidth: 560 }}>
            Find job opportunities across CARICOM member states. Live listings updated
            regularly from regional sources.
          </p>
        </div>

        {/* Two-column layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)',
            gap: '2rem',
            alignItems: 'start',
          }}
          className="jobs-layout"
        >

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Search controls card */}
            <div className="planner-card">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1.25rem' }}>
                Search Jobs
              </h2>

              {/* Country selector */}
              <label className="form-label">
                <span>Destination country</span>
                <select
                  className="form-select"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  <option value="">Select a country…</option>
                  {SORTED_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </label>

              {/* Profession selector */}
              <label className="form-label">
                <span>Your profession</span>
                <select
                  className="form-select"
                  value={selectedProfession}
                  onChange={(e) => setSelectedProfession(e.target.value)}
                >
                  <option value="">Select a profession…</option>
                  {PROFESSIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                className="btn-primary full-width"
                onClick={handleSearch}
                disabled={loading || !selectedCountry || !selectedProfession}
                style={{ marginTop: '0.5rem' }}
              >
                {loading ? 'Searching…' : 'Find Jobs'}
              </button>
            </div>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div>

            {/* Loading state */}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <ErrorCard
                message="Unable to load job listings."
                onRetry={() => doSearch(selectedCountry, selectedProfession, page)}
              />
            )}

            {/* Empty state */}
            {!loading && !error && !result && (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                }}
              >
                <svg
                  width="48" height="48" viewBox="0 0 48 48" fill="none"
                  style={{ margin: '0 auto 1rem', display: 'block' }}
                  aria-hidden="true"
                >
                  <circle cx="24" cy="24" r="24" fill="var(--color-primary-soft)" />
                  <path
                    d="M16 32V20a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12M20 18v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    stroke="var(--color-primary)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                  />
                  <path d="M20 24h8M20 28h5" stroke="var(--color-primary)" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  Select a country and profession to see available opportunities.
                </p>
              </div>
            )}

            {/* Results state */}
            {!loading && !error && result && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Results header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#111827', margin: 0 }}>
                    {result.listings.total > 0
                      ? `${result.listings.total} job${result.listings.total === 1 ? '' : 's'} found for `
                      : 'No live listings for '}
                    <span style={{ color: 'var(--color-primary)' }}>{result.profession}</span>
                    {' in '}
                    <span style={{ color: 'var(--color-primary)' }}>{result.country.name}</span>
                  </p>

                  {sourceBadge && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#6b7280',
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '999px',
                        padding: '0.2rem 0.7rem',
                      }}
                    >
                      <span
                        style={{
                          width: 7, height: 7, borderRadius: '50%',
                          background: sourceBadge.dot, flexShrink: 0,
                        }}
                      />
                      {sourceBadge.label}
                    </span>
                  )}
                </div>

                {/* No-results message */}
                {result.message && (
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                    {result.message}
                  </p>
                )}

                {/* Job cards */}
                {result.listings.jobs.map((job) => (
                  <JobCard
                    key={job.jobId}
                    job={job}
                    userProfession={selectedProfession}
                  />
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.5rem',
                    }}
                  >
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handlePage(page - 1)}
                      disabled={page <= 1}
                    >
                      ← Previous
                    </button>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Page {page}
                    </span>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handlePage(page + 1)}
                      disabled={page >= totalPages}
                    >
                      Next →
                    </button>
                  </div>
                )}

                {/* Curated links — always shown */}
                <CuratedJobLinks
                  countryLinks={result.curatedLinks.countryLinks}
                  professionLinks={result.curatedLinks.professionLinks}
                  caribbeanWideLinks={result.curatedLinks.caribbeanWideLinks}
                  countryName={result.country.name}
                  profession={result.profession}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
