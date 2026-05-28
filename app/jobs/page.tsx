'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
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

const COUNTRIES = Object.entries(COUNTRY_META)
  .map(([code, meta]) => ({ code, name: meta.name }))
  .sort((a, b) => a.name.localeCompare(b.name))

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

// ── Skeleton card ──────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '0.375rem', background: '#e5e7eb', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ height: 14, width: '55%', borderRadius: 4, background: '#e5e7eb', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: 11, width: '35%', borderRadius: 4, background: '#f3f4f6', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>
      <div style={{ height: 11, width: '70%', borderRadius: 4, background: '#f3f4f6', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: 11, width: '90%', borderRadius: 4, background: '#f3f4f6', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: 11, width: '60%', borderRadius: 4, background: '#f3f4f6', animation: 'pulse 1.5s ease-in-out infinite' }} />
    </div>
  )
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
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

        {/* Page header */}
        <div style={{ marginBottom: '2rem' }}>
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
                  {COUNTRIES.map((c) => (
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
              <div
                style={{
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  textAlign: 'center',
                }}
              >
                <p style={{ color: '#92400e', fontWeight: 600, marginBottom: '0.75rem' }}>
                  Unable to load job listings.
                </p>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => doSearch(selectedCountry, selectedProfession, page)}
                >
                  Try again
                </button>
              </div>
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
                  <circle cx="24" cy="24" r="24" fill="rgba(29,158,117,0.1)" />
                  <path
                    d="M16 32V20a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12M20 18v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    stroke="#1D9E75" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                  />
                  <path d="M20 24h8M20 28h5" stroke="#1D9E75" strokeWidth="1.75" strokeLinecap="round" />
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
                    <span style={{ color: '#1D9E75' }}>{result.profession}</span>
                    {' in '}
                    <span style={{ color: '#1D9E75' }}>{result.country.name}</span>
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

      {/* Mobile responsive override */}
      <style>{`
        @media (max-width: 768px) {
          .jobs-layout {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
      `}</style>
    </>
  )
}
