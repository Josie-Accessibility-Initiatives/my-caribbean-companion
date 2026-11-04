'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Lightbulb, ArrowRight } from 'lucide-react'
import CostEstimator from '@/components/cost/CostEstimator'
import BackButton from '@/components/ui/BackButton'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { countryName } from '@/lib/constants'
import { COUNTRY_OPTIONS } from '@/lib/options'
import { getOnboarding, type OnboardingContext } from '@/lib/persistence'
import { toCountryCode } from '@/lib/country-utils'

const INCLUDED_ITEMS = [
  'Flights: live web search pricing',
  'Housing deposit (2 months rent)',
  'Temporary accommodation (14 nights)',
  'Document fees (Skills cert, police cert)',
  'Shipping and moving costs',
  'First month living expenses',
  'Emergency buffer (3 months)',
]

const TIPS = [
  'Arrange temporary accommodation before you arrive to avoid rushed decisions',
  'Get all documents certified in your home country, which is cheaper and faster',
  'Connect with Caribbean expat Facebook groups to find housing leads',
  'Check if your employer covers any relocation costs before budgeting',
  'The XCD (East Caribbean Dollar) is fixed to USD, so no exchange rate risk for 6 CARICOM destinations',
]

export default function CostEstimatePage() {
  const [initialized, setInitialized] = useState(false)
  const [onboarding, setOnboarding] = useState<OnboardingContext | null>(null)
  const [showSelectors, setShowSelectors] = useState(false)
  const [fromCode, setFromCode] = useState('')
  const [toCode, setToCode] = useState('')

  // Pre-fill the route from the saved plan when there is one.
  useEffect(() => {
    const ctx = getOnboarding()
    const fc = ctx ? toCountryCode(ctx.homeCountry) : null
    const tc = ctx ? toCountryCode(ctx.targetCountry) : null
    if (ctx && fc && tc && fc !== tc) {
      setOnboarding(ctx)
      setFromCode(fc)
      setToCode(tc)
    } else {
      setShowSelectors(true)
    }
    setInitialized(true)
  }, [])

  const fromName = countryName(fromCode)
  const toName = countryName(toCode)
  const canEstimate = Boolean(fromCode && toCode && fromCode !== toCode)

  return (
    <main className="page-container page-container--tool">
      <div className="tool-header">
        <BackButton />
        <p className="dashboard-eyebrow eyebrow">CSME Free Movement</p>
        <h1 className="page-title">Relocation Cost Estimator</h1>
        <p className="page-lead">
          Get a detailed breakdown of what it costs to relocate to another
          Caribbean country under CSME. Flight prices from live search.
          Living costs researched from trusted sources.
        </p>
      </div>

      <div className="ce-page-grid">
        {/* ── Left column ── */}
        <div>
          {!initialized ? (
            <div className="planner-card mb-1-5 stack-md">
              <Skeleton width="40%" height={20} />
              <Skeleton height={40} />
            </div>
          ) : onboarding && !showSelectors ? (
            <div className="planner-card mb-1-5">
              <p className="dashboard-eyebrow ce-route-eyebrow">
                Estimating your move
              </p>
              <p className="ce-route-summary">
                From: <strong>{fromName || onboarding.homeCountry}</strong>
                {' → '}
                To: <strong>{toName || onboarding.targetCountry}</strong>
              </p>
              <button
                type="button"
                className="link-button link-button--underline"
                onClick={() => setShowSelectors(true)}
              >
                Estimate a different route
              </button>
            </div>
          ) : (
            <div className="planner-card mb-1-5">
              <div className="ce-selector-grid">
                <Select
                  label="Moving from:"
                  value={fromCode}
                  onChange={setFromCode}
                  options={COUNTRY_OPTIONS}
                  placeholder="Select country…"
                />
                <Select
                  label="Moving to:"
                  value={toCode}
                  onChange={setToCode}
                  options={COUNTRY_OPTIONS}
                  exclude={[fromCode]}
                  placeholder="Select country…"
                />
              </div>
              {fromCode && toCode && fromCode === toCode && (
                <p className="form-error mt-1">
                  Origin and destination must be different countries.
                </p>
              )}
            </div>
          )}

          {canEstimate ? (
            <CostEstimator
              key={`${fromCode}-${toCode}`}
              fromCountry={fromCode}
              toCountry={toCode}
              toCountryName={toName}
              category={onboarding?.category}
            />
          ) : initialized ? (
            <div className="empty-state">
              <p>
                Select your origin and destination countries above to see your
                cost estimate.
              </p>
            </div>
          ) : null}
        </div>

        {/* ── Right column ── */}
        <div className="stack">
          <div className="planner-card">
            <h3 className="icon-heading">
              <CheckCircle2 size={17} />
              What&apos;s included
            </h3>
            <ul className="dot-list">
              {INCLUDED_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="planner-card">
            <h3 className="icon-heading">
              <Lightbulb size={17} />
              Tips to reduce costs
            </h3>
            <ul className="dot-list dot-list--warm">
              {TIPS.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="planner-card ce-sidebar-cta">
            <h3>Ready to plan your move?</h3>
            <p>Get your personalized checklist and timeline for your CSME relocation.</p>
            <Link href="/onboarding" className="btn-primary full-width">
              Start My Move Plan
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
