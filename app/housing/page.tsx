'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Lightbulb } from 'lucide-react'
import BackButton from '@/components/ui/BackButton'
import { SkeletonBlock } from '@/components/ui/Skeleton'
import { ErrorCard } from '@/components/ui/ErrorCard'
import { Select } from '@/components/ui/Select'
import RentOverview from '@/components/housing/RentOverview'
import NeighborhoodGuide from '@/components/housing/NeighborhoodGuide'
import HousingLinks from '@/components/housing/HousingLinks'
import { COUNTRY_META } from '@/data/countryMeta'
import { COUNTRY_OPTIONS } from '@/lib/options'
import { toCountryCode } from '@/lib/country-utils'
import { getOnboarding } from '@/lib/persistence'
import { errorMessage, fetchJson } from '@/lib/fetch-json'
import { resolveRentRange, type HousingApiResponse } from '@/lib/types/housing'

const STATIC_TIPS = [
  "Arrange temporary accommodation before arriving. Don't commit to a long-term rental remotely",
  'Join the Facebook groups below to get insider knowledge before you arrive',
  'Ask employers if they offer any relocation or housing assistance',
  'Visit neighborhoods on weekends when locals are around to get a feel for the community',
]

function HousingTips({ liveTips }: { liveTips: string[] }) {
  return (
    <div className="card">
      <h2 className="card-heading">Local Housing Tips</h2>
      {liveTips.length > 0 && (
        <ul className="icon-list text-strong mb-1">
          {liveTips.map((tip) => (
            <li key={tip}>
              <Lightbulb size={16} color="#f59e0b" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      )}
      <ul className="icon-list text-muted">
        {STATIC_TIPS.map((tip) => (
          <li key={tip}>
            <Lightbulb size={16} color="#9ca3af" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function HousingResults({ data }: { data: HousingApiResponse }) {
  const { liveData, staticData, country } = data
  const oneBed = resolveRentRange(liveData.averageRentOneBed, staticData.averageRent?.oneBed)
  const twoBed = resolveRentRange(liveData.averageRentTwoBed, staticData.averageRent?.twoBed)

  return (
    <div className="stack-lg">
      {oneBed && twoBed && (
        <RentOverview
          averageRent={{ studio: staticData.averageRent?.studio, oneBed, twoBed }}
          currency={staticData.averageRent?.currency}
          note={staticData.averageRent?.note}
          source={liveData.source}
          countryName={country.name}
        />
      )}

      <HousingTips liveTips={liveData.tips} />

      {staticData.neighborhoods.length > 0 && (
        <div className="card">
          <NeighborhoodGuide neighborhoods={staticData.neighborhoods} countryName={country.name} />
        </div>
      )}

      <div className="card">
        <h2 className="card-heading">Find Housing in {country.name}</h2>
        <HousingLinks
          facebookGroups={staticData.facebookGroups}
          realEstateLinks={staticData.realEstateLinks}
          bookingComUrl={staticData.bookingComUrl}
          regional={data.regional}
          temporaryOptions={liveData.temporaryOptions}
        />
      </div>

      <div className="housing-cta">
        <h2>Ready to plan your full relocation?</h2>
        <p>See the full cost of moving and track your relocation checklist.</p>
        <div className="row row--center">
          <Link href="/cost-estimate" className="btn-primary">
            View Cost Estimate
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            Back to My Plan
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function HousingPage() {
  const searchParams = useSearchParams()
  const [selectedCountry, setSelectedCountry] = useState('')
  const [data, setData] = useState<HousingApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [planDestination, setPlanDestination] = useState<string | null>(null)

  const fetchHousing = useCallback(async (country: string) => {
    if (!country) return
    setLoading(true)
    setError(null)
    try {
      setData(
        await fetchJson<HousingApiResponse>(
          `/api/housing?country=${encodeURIComponent(country)}`,
          undefined,
          'Failed to load housing data'
        )
      )
    } catch (e) {
      setError(errorMessage(e, 'Failed to load housing data'))
    } finally {
      setLoading(false)
    }
  }, [])

  // ?country=BB takes priority, otherwise use the saved plan's destination.
  useEffect(() => {
    const urlCountry = searchParams.get('country')
    if (urlCountry && COUNTRY_META[urlCountry]) {
      setSelectedCountry(urlCountry)
      fetchHousing(urlCountry)
      return
    }

    const target = getOnboarding()?.targetCountry
    const code = target ? toCountryCode(target) : null
    if (!code) return

    setPlanDestination(COUNTRY_META[code].name)
    setSelectedCountry(code)
    fetchHousing(code)
  }, [fetchHousing, searchParams])

  const handleSearch = () => {
    setData(null)
    fetchHousing(selectedCountry)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <BackButton />
        <h1 className="section-title">Housing Discovery</h1>
        <p className="page-intro">
          Find accommodation in your destination country. Browse temporary stays,
          long-term rentals, and connect with local housing communities.
        </p>
      </div>

      <div className="card housing-search">
        <Select
          label="Select destination country"
          value={selectedCountry}
          onChange={setSelectedCountry}
          options={COUNTRY_OPTIONS}
          placeholder="Choose a country…"
        />
        <button
          type="button"
          className="btn-primary"
          onClick={handleSearch}
          disabled={loading || !selectedCountry}
        >
          {loading ? 'Searching…' : 'Find Housing'}
        </button>
      </div>

      {planDestination && (
        <div className="callout callout--success housing-context row-between">
          <p>
            Finding housing in <strong className="text-strong">{planDestination}</strong> for
            your relocation
          </p>
          <Link href="/onboarding" className="inline-link">
            Change destination →
          </Link>
        </div>
      )}

      {loading && (
        <div className="stack">
          {[148, 96, 196, 260].map((h) => (
            <SkeletonBlock key={h} height={h} />
          ))}
        </div>
      )}

      {!loading && error && (
        <ErrorCard message="Unable to load housing data." onRetry={() => fetchHousing(selectedCountry)} />
      )}

      {!loading && !error && !data && (
        <div className="empty-state">
          <p>Select a destination country to see housing resources.</p>
        </div>
      )}

      {!loading && !error && data && <HousingResults data={data} />}
    </div>
  )
}
