'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Lightbulb, ArrowRight } from 'lucide-react'
import { COUNTRY_META } from '@/data/countryMeta'
import { getOnboarding, type OnboardingContext } from '@/lib/persistence'
import CostEstimator from '@/components/dashboard/CostEstimator'

// ── Static data ───────────────────────────────────────────────────

const COUNTRY_LIST = Object.entries(COUNTRY_META)
  .map(([code, meta]) => ({ code, name: meta.name }))
  .sort((a, b) => a.name.localeCompare(b.name))

const INCLUDED_ITEMS = [
  'Flights — live web search pricing',
  'Housing deposit (2 months rent)',
  'Temporary accommodation (14 nights)',
  'Document fees (Skills cert, police cert)',
  'Shipping and moving costs',
  'First month living expenses',
  'Emergency buffer (3 months)',
]

const TIPS = [
  'Arrange temporary accommodation before you arrive to avoid rushed decisions',
  'Get all documents certified in your home country — cheaper and faster',
  'Connect with Caribbean expat Facebook groups to find housing leads',
  'Check if your employer covers any relocation costs before budgeting',
  'The XCD (East Caribbean Dollar) is fixed to USD — no exchange rate risk for 6 CARICOM destinations',
]

// ── Helpers ───────────────────────────────────────────────────────

function toCountryCode(nameOrCode: string): string | null {
  const trimmed = nameOrCode.trim()
  const up = trimmed.toUpperCase()
  if (COUNTRY_META[up]) return up
  const entry = Object.entries(COUNTRY_META).find(
    ([, meta]) => meta.name.toLowerCase() === trimmed.toLowerCase()
  )
  return entry?.[0] ?? null
}

// ── Page ──────────────────────────────────────────────────────────

export default function CostEstimatePage() {
  const [initialized, setInitialized] = useState(false)
  const [onboarding, setOnboarding] = useState<OnboardingContext | null>(null)
  const [showSelectors, setShowSelectors] = useState(false)
  const [fromCode, setFromCode] = useState('')
  const [toCode, setToCode] = useState('')

  useEffect(() => {
    const ctx = getOnboarding()
    if (ctx) {
      const fc = toCountryCode(ctx.homeCountry)
      const tc = toCountryCode(ctx.targetCountry)
      if (fc && tc && fc !== tc) {
        setOnboarding(ctx)
        setFromCode(fc)
        setToCode(tc)
      } else {
        setShowSelectors(true)
      }
    } else {
      setShowSelectors(true)
    }
    setInitialized(true)
  }, [])

  const fromName = COUNTRY_META[fromCode]?.name ?? fromCode
  const toName = COUNTRY_META[toCode]?.name ?? toCode
  const canEstimate = Boolean(fromCode && toCode && fromCode !== toCode)

  return (
    <>
      <style>{`
        @keyframes ce-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .ce-page-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          align-items: start;
        }
        .ce-selector-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        @media (max-width: 768px) {
          .ce-page-grid { grid-template-columns: 1fr; }
          .ce-selector-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <main
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '2.5rem 1.5rem 4rem',
        }}
      >
        {/* Page header */}
        <div style={{ marginBottom: '2.5rem', maxWidth: 680 }}>
          <p
            className="dashboard-eyebrow"
            style={{ marginTop: 0, marginBottom: '0.5rem' }}
          >
            CSME Free Movement
          </p>
          <h1
            style={{
              margin: '0 0 0.75rem',
              fontSize: '2rem',
              fontWeight: 700,
              lineHeight: 1.2,
              color: '#111827',
            }}
          >
            Relocation Cost Estimator
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '1.05rem',
              color: '#4b5563',
              lineHeight: 1.65,
            }}
          >
            Get a detailed breakdown of what it costs to relocate to another
            Caribbean country under CSME. Flight prices from live search.
            Living costs researched from trusted sources.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="ce-page-grid">
          {/* ── Left column ─────────────────────────────── */}
          <div>
            {/* Country selection area */}
            {!initialized ? (
              <div className="planner-card" style={{ marginBottom: '1.5rem' }}>
                <div
                  style={{
                    height: 20,
                    width: '40%',
                    background: '#e5e7eb',
                    borderRadius: '0.375rem',
                    marginBottom: '0.75rem',
                    animation: 'ce-pulse 1.5s ease-in-out infinite',
                  }}
                />
                <div
                  style={{
                    height: 40,
                    background: '#e5e7eb',
                    borderRadius: '0.375rem',
                    animation: 'ce-pulse 1.5s ease-in-out infinite',
                  }}
                />
              </div>
            ) : onboarding && !showSelectors ? (
              /* Pre-filled from onboarding */
              <div className="planner-card" style={{ marginBottom: '1.5rem' }}>
                <p
                  className="dashboard-eyebrow"
                  style={{ marginTop: 0, marginBottom: '0.4rem' }}
                >
                  Estimating your move
                </p>
                <p
                  style={{
                    margin: '0 0 0.75rem',
                    fontSize: '1rem',
                    color: '#111827',
                  }}
                >
                  From: <strong>{fromName || onboarding.homeCountry}</strong>
                  {' → '}
                  To: <strong>{toName || onboarding.targetCountry}</strong>
                </p>
                <button
                  onClick={() => setShowSelectors(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: '#1D9E75',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    fontFamily: 'inherit',
                    textDecoration: 'underline',
                  }}
                >
                  Estimate a different route
                </button>
              </div>
            ) : (
              /* Country selectors */
              <div className="planner-card" style={{ marginBottom: '1.5rem' }}>
                <div className="ce-selector-grid">
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    <span
                      style={{ fontWeight: 500, fontSize: '0.875rem' }}
                    >
                      Moving from:
                    </span>
                    <select
                      className="form-select"
                      value={fromCode}
                      onChange={(e) => setFromCode(e.target.value)}
                    >
                      <option value="">Select country…</option>
                      {COUNTRY_LIST.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="form-label" style={{ marginBottom: 0 }}>
                    <span
                      style={{ fontWeight: 500, fontSize: '0.875rem' }}
                    >
                      Moving to:
                    </span>
                    <select
                      className="form-select"
                      value={toCode}
                      onChange={(e) => setToCode(e.target.value)}
                    >
                      <option value="">Select country…</option>
                      {COUNTRY_LIST.filter((c) => c.code !== fromCode).map(
                        (c) => (
                          <option key={c.code} value={c.code}>
                            {c.name}
                          </option>
                        )
                      )}
                    </select>
                  </label>
                </div>

                {fromCode && toCode && fromCode === toCode && (
                  <p
                    style={{
                      margin: '0.75rem 0 0',
                      fontSize: '0.85rem',
                      color: '#991b1b',
                    }}
                  >
                    Origin and destination must be different countries.
                  </p>
                )}
              </div>
            )}

            {/* Estimator or empty state */}
            {canEstimate ? (
              <CostEstimator
                key={`${fromCode}-${toCode}`}
                fromCountry={fromCode}
                toCountry={toCode}
                toCountryName={toName}
                category={onboarding?.category}
              />
            ) : initialized ? (
              <div
                className="planner-card"
                style={{
                  textAlign: 'center',
                  padding: '3rem 1.5rem',
                  color: '#6b7280',
                }}
              >
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Select your origin and destination countries above to see your
                  cost estimate.
                </p>
              </div>
            ) : null}
          </div>

          {/* ── Right column ────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Card 1: What's included */}
            <div className="planner-card">
              <h3
                style={{
                  margin: '0 0 0.9rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: '#111827',
                }}
              >
                <CheckCircle2 size={17} color="#1D9E75" />
                What&apos;s included
              </h3>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {INCLUDED_ITEMS.map((item) => (
                  <li
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.55rem',
                      fontSize: '0.85rem',
                      color: '#4b5563',
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: '#1D9E75',
                        flexShrink: 0,
                        marginTop: '0.44rem',
                      }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 2: Tips */}
            <div className="planner-card">
              <h3
                style={{
                  margin: '0 0 0.9rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: '#111827',
                }}
              >
                <Lightbulb size={17} color="#1D9E75" />
                Tips to reduce costs
              </h3>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                {TIPS.map((tip, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.55rem',
                      fontSize: '0.82rem',
                      color: '#4b5563',
                      lineHeight: 1.55,
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: '#f59e0b',
                        flexShrink: 0,
                        marginTop: '0.44rem',
                      }}
                    />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 3: CTA */}
            <div
              className="planner-card"
              style={{ background: '#f0fdf8', borderColor: '#bbf7d0' }}
            >
              <h3
                style={{
                  margin: '0 0 0.5rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#111827',
                }}
              >
                Ready to plan your move?
              </h3>
              <p
                style={{
                  margin: '0 0 1.1rem',
                  fontSize: '0.85rem',
                  color: '#4b5563',
                  lineHeight: 1.6,
                }}
              >
                Get your personalized checklist and timeline for your CSME
                relocation.
              </p>
              <Link
                href="/onboarding"
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  textDecoration: 'none',
                  boxSizing: 'border-box',
                  width: '100%',
                }}
              >
                Start My Move Plan
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
