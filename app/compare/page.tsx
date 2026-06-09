'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { getOnboarding } from '@/lib/persistence'
import { COUNTRY_META } from '@/data/countryMeta'
import ComparisonTable, {
  type CountryComparisonData,
} from '@/components/compare/ComparisonTable'
import ComparisonCharts from '@/components/compare/ComparisonCharts'
import ProfessionHeatmap from '@/components/compare/ProfessionHeatmap'
import CurrencySelector from '@/components/compare/CurrencySelector'

// ── Constants ─────────────────────────────────────────────────────

const COUNTRY_ORDER = [
  'TT', 'BB', 'JM', 'GY', 'LC', 'GD',
  'DM', 'VC', 'KN', 'AG', 'SR', 'BZ',
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

// ── Section wrapper ───────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="cp-section">
      <div className="cp-section-hd">
        <h2 className="cp-section-title">{title}</h2>
        {description && (
          <p className="cp-section-desc">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────

export default function ComparePage() {
  const [allData, setAllData] = useState<
    Record<string, CountryComparisonData>
  >({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(
    () => new Set(COUNTRY_ORDER)
  )
  const [highlightCountry, setHighlightCountry] = useState<
    string | undefined
  >()
  const [userCategory, setUserCategory] = useState<string | undefined>()
  const [hasPlan, setHasPlan] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [exchangeRates, setExchangeRates] = useState<
    Record<string, number> | null
  >(null)

  useEffect(() => {
    const ctx = getOnboarding()
    if (ctx) {
      const tc = toCountryCode(ctx.targetCountry)
      if (tc) setHighlightCountry(tc)
      if (ctx.category) setUserCategory(ctx.category)
      setHasPlan(true)
    }

    const saved =
      localStorage.getItem('mcc_preferred_currency') ?? 'USD'
    setSelectedCurrency(saved)

    async function load() {
      try {
        const [compareRes, ratesRes] = await Promise.all([
          fetch('/api/compare?all=true'),
          fetch('/api/exchange-rates'),
        ])
        if (!compareRes.ok) throw new Error(`HTTP ${compareRes.status}`)
        const [json, rates] = await Promise.all([
          compareRes.json(),
          ratesRes.ok ? ratesRes.json() : Promise.resolve(null),
        ])
        setAllData(json)
        setExchangeRates(rates)
      } catch (err) {
        console.error('ComparePage fetch error:', err)
        setError('Unable to load comparison data.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // Filter allData to only selected country codes
  const filteredData = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(allData).filter(([code]) =>
          selectedCodes.has(code)
        )
      ),
    [allData, selectedCodes]
  )

  function toggleCountry(code: string) {
    setSelectedCodes((prev) => {
      const next = new Set(prev)
      if (next.has(code)) {
        if (next.size > 1) next.delete(code)
      } else {
        next.add(code)
      }
      return next
    })
  }

  const ctaName =
    highlightCountry && COUNTRY_META[highlightCountry]
      ? COUNTRY_META[highlightCountry].name
      : 'the Caribbean'

  return (
    <>
      <style>{PAGE_STYLES}</style>

      <main className="cp-main">

        {/* ── Page header ───────────────────────────────────── */}
        <div className="cp-header">
          <p
            className="dashboard-eyebrow"
            style={{ marginTop: 0, marginBottom: '0.5rem' }}
          >
            CSME Free Movement
          </p>
          <h1 className="cp-h1">Compare Caribbean Countries</h1>
          <p className="cp-subtitle">
            Compare cost of living, quality of life, CSME complexity, and
            job demand across all CARICOM member states.
          </p>
        </div>

        {/* ── Error ─────────────────────────────────────────── */}
        {error && (
          <div className="cp-error-card">
            <p className="cp-error-msg">
              Unable to load comparison data.
            </p>
            <button
              className="cp-retry-btn"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        )}

        {!error && (
          <>
            {/* ── SECTION 1: Country selector ───────────────── */}
            <Section title="Countries">
              <div className="cp-selector-bar">
                <p className="cp-count">
                  Comparing{' '}
                  <strong>{selectedCodes.size}</strong> of{' '}
                  {COUNTRY_ORDER.length} countries
                </p>
                <div className="cp-selector-actions">
                  <button
                    className="cp-action-btn"
                    onClick={() =>
                      setSelectedCodes(new Set(COUNTRY_ORDER))
                    }
                  >
                    Select all
                  </button>
                  <button
                    className="cp-action-btn"
                    onClick={() =>
                      setSelectedCodes(new Set([COUNTRY_ORDER[0]]))
                    }
                  >
                    Clear all
                  </button>
                </div>
              </div>

              <div className="cp-pills">
                {COUNTRY_ORDER.map((code) => {
                  const on = selectedCodes.has(code)
                  const isTarget = code === highlightCountry
                  return (
                    <button
                      key={code}
                      className={[
                        'cp-pill',
                        on ? 'cp-pill-on' : 'cp-pill-off',
                        isTarget ? 'cp-pill-target' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => toggleCountry(code)}
                      title={COUNTRY_META[code]?.name ?? code}
                    >
                      <span className="cp-pill-code">{code}</span>
                    </button>
                  )
                })}
              </div>
            </Section>

            {/* ── SECTION 2: Data table ─────────────────────── */}
            <Section title="Data Comparison">
              <CurrencySelector
                selected={selectedCurrency}
                onChange={(code) => {
                  setSelectedCurrency(code)
                  localStorage.setItem('mcc_preferred_currency', code)
                }}
                rates={exchangeRates}
              />
              {loading && <TableSkeleton />}
              {!loading && (
                <ComparisonTable
                  data={filteredData}
                  userCategory={userCategory}
                  highlightCountry={highlightCountry}
                  selectedCurrency={selectedCurrency}
                  exchangeRates={exchangeRates}
                />
              )}
            </Section>

            {/* ── SECTION 3: Charts ─────────────────────────── */}
            <Section title="Visual Comparison">
              <ComparisonCharts
                data={loading ? {} : filteredData}
                highlightCountry={highlightCountry}
                selectedCurrency={selectedCurrency}
                exchangeRates={exchangeRates}
              />
            </Section>

            {/* ── SECTION 4: Profession heatmap ─────────────── */}
            <Section
              title="In-Demand Professions"
              description="Which skills are sought across CARICOM countries under CSME free movement."
            >
              <ProfessionHeatmap
                data={loading ? {} : filteredData}
                highlightProfession={userCategory}
              />
            </Section>

            {/* ── Loading progress (overlaid below sections) ── */}
            {loading && (
              <div className="cp-loading-bar">
                <div className="cp-spinner" />
                <div>
                  <p className="cp-loading-msg">
                    Loading data from World Bank, REST Countries, and
                    regional sources…
                  </p>
                  <p className="cp-loading-sub">
                    First load may take 10–15 seconds as all APIs are
                    called in parallel.
                  </p>
                </div>
              </div>
            )}

            {/* ── SECTION 5: CTA ────────────────────────────── */}
            {!loading && (
              <div className="cp-cta">
                <div className="cp-cta-body">
                  <h3 className="cp-cta-title">
                    Ready to plan your move to {ctaName}?
                  </h3>
                  <p className="cp-cta-sub">
                    Get your personalised CSME checklist, timeline, and
                    relocation cost estimate.
                  </p>
                </div>
                <div className="cp-cta-actions">
                  {hasPlan ? (
                    <Link
                      href="/dashboard"
                      className="btn-primary cp-cta-btn"
                    >
                      View My Plan
                    </Link>
                  ) : (
                    <Link
                      href="/onboarding"
                      className="btn-primary cp-cta-btn"
                    >
                      Start My Move Plan
                    </Link>
                  )}
                  <Link href="/cost-estimate" className="cp-cta-link">
                    Estimate relocation costs →
                  </Link>
                </div>
              </div>
            )}

            {/* ── Footnote ──────────────────────────────────── */}
            {!loading && (
              <p className="cp-footnote">
                GDP and population from World Bank (cached 30 days). Cost
                of living from live web search (cached 7 days). QoL scores
                from Numbeo via live search (cached 7 days). Scores shown
                as <strong>–</strong> when not available for that country.
              </p>
            )}
          </>
        )}
      </main>
    </>
  )
}

// ── Table skeleton ────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: 12,
            padding: '11px 16px',
            borderBottom: i < 6 ? '1px solid #f1f5f9' : 'none',
          }}
        >
          <div
            style={{
              width: 120,
              height: 16,
              borderRadius: 4,
              background: '#e5e7eb',
              flexShrink: 0,
              animation: 'cp-shimmer 1.4s ease-in-out infinite',
            }}
          />
          {Array.from({ length: 7 }).map((_, j) => (
            <div
              key={j}
              style={{
                flex: 1,
                height: 16,
                borderRadius: 4,
                background: '#e5e7eb',
                animation: 'cp-shimmer 1.4s ease-in-out infinite',
                animationDelay: `${j * 0.05}s`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────

const PAGE_STYLES = `
@keyframes cp-spin {
  to { transform: rotate(360deg); }
}
@keyframes cp-shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.cp-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 5rem;
}

.cp-header {
  margin-bottom: 2rem;
  max-width: 680px;
}

.cp-h1 {
  margin: 0 0 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  color: #111827;
}

.cp-subtitle {
  margin: 0;
  font-size: 1.05rem;
  color: #4b5563;
  line-height: 1.65;
}

.cp-section {
  margin-bottom: 2.5rem;
}

.cp-section-hd {
  margin-bottom: 14px;
}

.cp-section-title {
  margin: 0 0 4px;
  font-size: 1.15rem;
  font-weight: 700;
  color: #111827;
}

.cp-section-desc {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.55;
}

/* Country selector */
.cp-selector-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.cp-count {
  margin: 0;
  font-size: 13.5px;
  color: #6b7280;
}

.cp-selector-actions {
  display: flex;
  gap: 6px;
}

.cp-action-btn {
  padding: 5px 12px;
  font-size: 12.5px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  color: #374151;
  font-family: inherit;
  transition: background 0.12s;
}
.cp-action-btn:hover { background: #f3f4f6; }

.cp-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cp-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid transparent;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.13s;
  line-height: 1;
}

.cp-pill-on {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
.cp-pill-on:hover { background: var(--color-primary-dark); border-color: var(--color-primary-dark); }

.cp-pill-off {
  background: #f3f4f6;
  color: #9ca3af;
  border-color: #e5e7eb;
}
.cp-pill-off:hover { background: #e5e7eb; color: #6b7280; }

.cp-pill-target.cp-pill-on {
  background: #0ea5e9;
  border-color: #0284c7;
  box-shadow: 0 0 0 2px rgba(14,165,233,0.25);
}
.cp-pill-target.cp-pill-on:hover {
  background: #0284c7;
  border-color: #0369a1;
}

.cp-pill-code { letter-spacing: 0.03em; }

/* Loading */
.cp-loading-bar {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 10px;
  margin-bottom: 2rem;
}

.cp-spinner {
  width: 22px;
  height: 22px;
  border: 2.5px solid #e0f2fe;
  border-top-color: #0ea5e9;
  border-radius: 50%;
  animation: cp-spin 0.8s linear infinite;
  flex-shrink: 0;
  margin-top: 2px;
}

.cp-loading-msg {
  margin: 0 0 3px;
  font-size: 14px;
  font-weight: 500;
  color: #0c4a6e;
}

.cp-loading-sub {
  margin: 0;
  font-size: 12.5px;
  color: #0369a1;
}

/* Error */
.cp-error-card {
  padding: 2rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 2rem;
}

.cp-error-msg {
  margin: 0 0 1rem;
  color: #991b1b;
  font-size: 0.95rem;
}

.cp-retry-btn {
  padding: 8px 20px;
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
}
.cp-retry-btn:hover { background: #b91c1c; }

/* CTA */
.cp-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  padding: 24px 28px;
  background: linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%);
  border: 1px solid #a7f3d0;
  border-radius: 14px;
  margin-bottom: 20px;
}

.cp-cta-title {
  margin: 0 0 6px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
}

.cp-cta-sub {
  margin: 0;
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.55;
}

.cp-cta-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.cp-cta-btn {
  text-decoration: none;
  white-space: nowrap;
}

.cp-cta-link {
  font-size: 13.5px;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  white-space: nowrap;
}
.cp-cta-link:hover { text-decoration: underline; }

/* Footnote */
.cp-footnote {
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.55;
  margin: 0;
}

@media (max-width: 640px) {
  .cp-h1 { font-size: 1.6rem; }
  .cp-selector-bar { flex-direction: column; align-items: flex-start; }
  .cp-cta { flex-direction: column; align-items: flex-start; }
  .cp-cta-actions { flex-direction: column; align-items: flex-start; gap: 10px; }
}
`
