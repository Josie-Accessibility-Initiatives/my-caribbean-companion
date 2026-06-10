'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import BackButton from '@/components/ui/BackButton'
import { SkeletonBlock } from '@/components/ui/Skeleton'
import { ErrorCard } from '@/components/ui/ErrorCard'
import { SORTED_COUNTRIES } from '@/lib/constants'
import { Lightbulb } from 'lucide-react'
import { COUNTRY_META } from '@/data/countryMeta'
import { getOnboarding } from '@/lib/persistence'
import RentOverview from '@/components/housing/RentOverview'
import NeighborhoodGuide from '@/components/housing/NeighborhoodGuide'
import HousingLinks from '@/components/housing/HousingLinks'
import type { Neighborhood, FacebookGroup, RealEstateLink, RegionalLink } from '@/lib/types/housing'

// ── Types ──────────────────────────────────────────────────────────

type RentRange = { min: number; max: number }

type HousingApiResponse = {
  country: { code: string; name: string; capital: string; searchCity: string }
  liveData: {
    averageRentOneBed: { min: number | null; max: number | null } | null
    averageRentTwoBed: { min: number | null; max: number | null } | null
    temporaryOptions: {
      name: string
      pricePerNight: number | null
      url: string
      type: string
    }[]
    tips: string[]
    source: 'tavily' | 'fallback'
    searchedAt: string
  }
  staticData: {
    averageRent: {
      studio: RentRange
      oneBed: RentRange
      twoBed: RentRange
      currency: string
      note: string
    } | null
    neighborhoods: Neighborhood[]
    facebookGroups: FacebookGroup[]
    realEstateLinks: RealEstateLink[]
    bookingComUrl: string | null
  }
  regional: RegionalLink[]
}

// ── Static data ────────────────────────────────────────────────────

const STATIC_TIPS = [
  "Arrange temporary accommodation before arriving. Don't commit to a long-term rental remotely",
  'Join the Facebook groups below to get insider knowledge before you arrive',
  'Ask employers if they offer any relocation or housing assistance',
  'Visit neighborhoods on weekends when locals are around to get a feel for the community',
]

// ── Helpers ────────────────────────────────────────────────────────

function resolveRentRange(
  live: { min: number | null; max: number | null } | null | undefined,
  fallback: RentRange | null | undefined
): RentRange | null {
  if (live?.min != null && live?.max != null) return { min: live.min, max: live.max }
  if (fallback) return fallback
  return null
}

// ── Page ───────────────────────────────────────────────────────────

export default function HousingPage() {
  const searchParams = useSearchParams()
  const [selectedCountry, setSelectedCountry] = useState('')
  const [housingData, setHousingData] = useState<HousingApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [onboardingCtx, setOnboardingCtx] = useState<{
    targetCountry: string
  } | null>(null)

  const fetchHousing = useCallback(async (country: string) => {
    if (!country) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/housing?country=${encodeURIComponent(country)}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'Failed to load housing data')
      }
      setHousingData(await res.json() as HousingApiResponse)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load housing data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // URL param (?country=BB) takes priority over localStorage
    const urlCountry = searchParams.get('country')
    if (urlCountry && COUNTRY_META[urlCountry]) {
      setSelectedCountry(urlCountry)
      fetchHousing(urlCountry)
      return
    }

    // Fall back to onboarding localStorage
    const onb = getOnboarding()
    if (!onb) return

    const code =
      Object.entries(COUNTRY_META).find(
        ([c, m]) => c === onb.targetCountry || m.name === onb.targetCountry
      )?.[0] ?? ''

    if (!code) return

    const name = COUNTRY_META[code]?.name ?? onb.targetCountry
    setOnboardingCtx({ targetCountry: name })
    setSelectedCountry(code)
    fetchHousing(code)
  }, [fetchHousing, searchParams])

  const handleSearch = () => {
    setHousingData(null)
    fetchHousing(selectedCountry)
  }

  const data = housingData
  const oneBed = data
    ? resolveRentRange(data.liveData.averageRentOneBed, data.staticData.averageRent?.oneBed)
    : null
  const twoBed = data
    ? resolveRentRange(data.liveData.averageRentTwoBed, data.staticData.averageRent?.twoBed)
    : null

  return (
    <>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

        {/* Page header */}
        <div style={{ marginBottom: '2rem' }}>
          <BackButton />
          <h1 className="section-title" style={{ marginBottom: '0.35rem' }}>
            Housing Discovery
          </h1>
          <p style={{ color: '#6b7280', margin: 0, maxWidth: 580 }}>
            Find accommodation in your destination country. Browse temporary stays,
            long-term rentals, and connect with local housing communities.
          </p>
        </div>

        {/* Section 1 — Country selector */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
            padding: '1.25rem 1.5rem',
            marginBottom: '1rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'flex-end',
          }}
        >
          <label
            className="form-label"
            style={{ flex: '1 1 240px', margin: 0 }}
          >
            <span>Select destination country</span>
            <select
              className="form-select"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              style={{ marginTop: '0.35rem' }}
            >
              <option value="">Choose a country…</option>
              {SORTED_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="btn-primary"
            onClick={handleSearch}
            disabled={loading || !selectedCountry}
            style={{ flexShrink: 0, alignSelf: 'flex-end' }}
          >
            {loading ? 'Searching…' : 'Find Housing'}
          </button>
        </div>

        {/* Onboarding context card */}
        {onboardingCtx && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '0.75rem',
              padding: '0.85rem 1.1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151' }}>
              Finding housing in{' '}
              <strong style={{ color: '#111827' }}>{onboardingCtx.targetCountry}</strong>{' '}
              for your relocation
            </p>
            <Link
              href="/onboarding"
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-primary)',
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Change destination →
            </Link>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <SkeletonBlock height={148} />
            <SkeletonBlock height={96} />
            <SkeletonBlock height={196} />
            <SkeletonBlock height={260} />
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <ErrorCard
            message="Unable to load housing data."
            onRetry={() => fetchHousing(selectedCountry)}
          />
        )}

        {/* Empty state */}
        {!loading && !error && !data && (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              padding: '3rem 2rem',
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#6b7280', margin: 0 }}>
              Select a destination country to see housing resources.
            </p>
          </div>
        )}

        {/* Data sections */}
        {!loading && !error && data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Section 2 — Rent overview */}
            {oneBed && twoBed && (
              <RentOverview
                averageRent={{
                  studio: data.staticData.averageRent?.studio,
                  oneBed,
                  twoBed,
                }}
                currency={data.staticData.averageRent?.currency}
                note={data.staticData.averageRent?.note}
                source={data.liveData.source}
                countryName={data.country.name}
              />
            )}

            {/* Section 3 — Housing tips */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                padding: '1.25rem 1.5rem',
              }}
            >
              <h2
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: '#111827',
                  margin: '0 0 1rem',
                }}
              >
                Local Housing Tips
              </h2>

              {data.liveData.tips.length > 0 && (
                <ul
                  style={{
                    margin: '0 0 0.85rem',
                    paddingLeft: 0,
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                  }}
                >
                  {data.liveData.tips.map((tip, i) => (
                    <li
                      key={i}
                      style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}
                    >
                      <Lightbulb
                        size={16}
                        color="#f59e0b"
                        style={{ flexShrink: 0, marginTop: 2 }}
                      />
                      <span style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.5 }}>
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <ul
                style={{
                  margin: 0,
                  paddingLeft: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >
                {STATIC_TIPS.map((tip, i) => (
                  <li
                    key={i}
                    style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}
                  >
                    <Lightbulb
                      size={16}
                      color="#9ca3af"
                      style={{ flexShrink: 0, marginTop: 2 }}
                    />
                    <span style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.5 }}>
                      {tip}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 4 — Neighborhood guide */}
            {data.staticData.neighborhoods.length > 0 && (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  padding: '1.25rem 1.5rem',
                }}
              >
                <NeighborhoodGuide
                  neighborhoods={data.staticData.neighborhoods}
                  countryName={data.country.name}
                />
              </div>
            )}

            {/* Section 5 — Housing links */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                padding: '1.25rem 1.5rem',
              }}
            >
              <h2
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: '#111827',
                  margin: '0 0 1.25rem',
                }}
              >
                Find Housing in {data.country.name}
              </h2>
              <HousingLinks
                facebookGroups={data.staticData.facebookGroups}
                realEstateLinks={data.staticData.realEstateLinks}
                bookingComUrl={data.staticData.bookingComUrl}
                regional={data.regional}
                countryName={data.country.name}
                temporaryOptions={data.liveData.temporaryOptions}
              />
            </div>

            {/* Section 6 — CTA */}
            <div
              style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                border: '1px solid #bbf7d0',
                borderRadius: '0.75rem',
                padding: '1.75rem 1.5rem',
                textAlign: 'center',
              }}
            >
              <h2
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#111827',
                  margin: '0 0 0.4rem',
                }}
              >
                Ready to plan your full relocation?
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: '0 0 1.25rem',
                }}
              >
                See the full cost of moving and track your relocation checklist.
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Link
                  href="/cost-estimate"
                  className="btn-primary"
                  style={{ textDecoration: 'none' }}
                >
                  View Cost Estimate
                </Link>
                <Link
                  href="/dashboard"
                  className="btn-secondary"
                  style={{ textDecoration: 'none' }}
                >
                  Back to My Plan
                </Link>
              </div>
            </div>

          </div>
        )}

      </div>
    </>
  )
}
