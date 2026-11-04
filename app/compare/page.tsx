'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import BackButton from '@/components/ui/BackButton'
import { toCountryCode } from '@/lib/country-utils'
import {
  getOnboarding,
  readPreferredCurrency,
  writePreferredCurrency,
} from '@/lib/persistence'
import { COUNTRY_ORDER } from '@/lib/constants'
import { fetchJson } from '@/lib/fetch-json'
import type { CountryComparisonData } from '@/lib/types/comparison'
import { COUNTRY_META } from '@/data/countryMeta'
import ComparisonTable from '@/components/compare/ComparisonTable'
import ComparisonCharts from '@/components/compare/ComparisonCharts'
import ProfessionHeatmap from '@/components/compare/ProfessionHeatmap'
import CurrencySelector from '@/components/compare/CurrencySelector'
import { TableSkeleton } from '@/components/ui/Skeleton'

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

    setSelectedCurrency(readPreferredCurrency())

    async function load() {
      try {
        const [json, rates] = await Promise.all([
          fetchJson<Record<string, CountryComparisonData>>('/api/compare?all=true'),
          // Rates are optional: the table falls back to USD without them.
          fetchJson<Record<string, number>>('/api/exchange-rates').catch(() => null),
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
    <main className="cp-main">

        {/* ── Page header ───────────────────────────────────── */}
        <div className="cp-header">
          <BackButton />
          <p className="dashboard-eyebrow eyebrow">CSME Free Movement</p>
          <h1 className="page-title">Compare Caribbean Countries</h1>
          <p className="page-lead">
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
                      {code}
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
                  writePreferredCurrency(code)
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
  )
}
