'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Plane,
  Home,
  Building2,
  FileText,
  Package,
  ShoppingCart,
  Shield,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react'
import CostLineItem, { type CostLineItemProps } from '@/components/cost/CostLineItem'
import CostSkeleton from '@/components/cost/CostSkeleton'
import CostBreakdownChart from '@/components/cost/CostBreakdownChart'
import { fmt, fmtUsdRange } from '@/lib/format'
import { errorMessage, postJson } from '@/lib/fetch-json'
import { BUDGET_LEVELS, type BudgetLevel, type CostEstimateResponse } from '@/lib/types/cost'

export interface CostEstimatorProps {
  fromCountry: string
  toCountry: string
  toCountryName: string
  category?: string
  onViewed?: () => void
}

const BUDGET_LABELS: Record<BudgetLevel, string> = {
  budget: 'Budget',
  mid: 'Mid-Range',
  comfortable: 'Comfortable',
}

function ExternalAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-link">
      {children} <ExternalLink size={11} />
    </a>
  )
}

/** Turn the API breakdown into the rows shown in the list and the chart. */
function buildLineItems(
  data: CostEstimateResponse,
  livingBreakdown: ReactNode
): (CostLineItemProps & { chartLabel: string })[] {
  const b = data.breakdown
  return [
    {
      chartLabel: 'Flights',
      icon: <Plane size={18} />,
      label: 'Flights',
      source: b.flights.source,
      amount: b.flights.amount,
      description: (
        <>
          Range: {fmtUsdRange(b.flights.min, b.flights.max)}
          {b.flights.airlines.length > 0 && (
            <span className="text-subtle"> · {b.flights.airlines.slice(0, 3).join(', ')}</span>
          )}
        </>
      ),
      extra: <ExternalAction href={b.flights.googleFlightsUrl}>Check live prices</ExternalAction>,
    },
    {
      chartLabel: 'Housing Deposit',
      icon: <Home size={18} />,
      label: 'Housing Deposit',
      source: 'fallback',
      amount: b.housingDeposit.amount,
      description: b.housingDeposit.note,
    },
    {
      chartLabel: 'Temp. Stay',
      icon: <Building2 size={18} />,
      label: 'Temporary Accommodation',
      source: 'fallback',
      amount: b.temporaryAccommodation.amount,
      description: `${b.temporaryAccommodation.nights} nights while settling in · ${fmt(
        b.temporaryAccommodation.perNight
      )}/night`,
      extra: (
        <ExternalAction href={b.temporaryAccommodation.bookingComUrl}>Browse options</ExternalAction>
      ),
    },
    {
      chartLabel: 'Documents',
      icon: <FileText size={18} />,
      label: 'Document Fees',
      source: 'fallback',
      amount: b.documentFees.amount,
      description: 'Skills certificate, police certificate, notarization',
    },
    {
      chartLabel: 'Shipping',
      icon: <Package size={18} />,
      label: 'Shipping & Moving',
      source: 'fallback',
      amount: b.shipping.amount,
      description: b.shipping.note,
    },
    {
      chartLabel: 'Month 1 Living',
      icon: <ShoppingCart size={18} />,
      label: 'First Month Living',
      source: b.flights.source,
      amount: b.firstMonthLiving.amount,
      description: 'Rent, groceries, transport, and utilities',
      extra: livingBreakdown,
    },
    {
      chartLabel: 'Emergency Fund',
      icon: <Shield size={18} />,
      label: 'Emergency Buffer',
      source: 'fallback',
      amount: b.emergencyBuffer.amount,
      description: `${b.emergencyBuffer.months} months expenses recommended`,
    },
  ]
}

export default function CostEstimator({
  fromCountry,
  toCountry,
  toCountryName,
  category,
  onViewed,
}: CostEstimatorProps) {
  const [data, setData] = useState<CostEstimateResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel>('mid')
  const [expandedLiving, setExpandedLiving] = useState(false)
  const viewedRef = useRef(false)

  async function fetchEstimate(level: BudgetLevel) {
    setLoading(true)
    setError(null)
    try {
      const json = await postJson<CostEstimateResponse>(
        '/api/cost-estimate',
        { fromCountry, toCountry, category, budgetLevel: level },
        'Failed to load estimate'
      )
      setData(json)
      if (!viewedRef.current) {
        onViewed?.()
        viewedRef.current = true
      }
    } catch (err) {
      setError(errorMessage(err, 'Unable to load cost estimate.'))
    } finally {
      setLoading(false)
    }
  }

  // Fetch once on mount; parents remount (via `key`) when the route changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchEstimate('mid') }, [])

  function handleBudgetChange(level: BudgetLevel) {
    setBudgetLevel(level)
    fetchEstimate(level)
  }

  const living = data?.breakdown.firstMonthLiving.breakdown
  const livingBreakdown = living && (
    <>
      <button type="button" className="link-button" onClick={() => setExpandedLiving((v) => !v)}>
        {expandedLiving ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {expandedLiving ? 'Hide' : 'Show'} breakdown
      </button>
      {expandedLiving && (
        <div className="ce-living-breakdown">
          <span>Rent: <strong>{fmt(living.rent)}</strong></span>
          <span>Groceries: <strong>{fmt(living.groceries)}</strong></span>
          <span>Transport: <strong>{fmt(living.transport)}</strong></span>
          <span>Utilities: <strong>{fmt(living.utilities)}</strong></span>
        </div>
      )}
    </>
  )

  const lineItems = data ? buildLineItems(data, livingBreakdown) : []

  return (
    <div className="planner-card">
      <p className="dashboard-eyebrow eyebrow">Cost Estimator</p>
      <h2 className="ce-heading">{toCountryName} Relocation Budget</h2>
      <p className="ce-route">
        {fromCountry} → {toCountry} · CSME Free Movement of Skills
      </p>

      <div className="ce-budget-selector">
        {BUDGET_LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => handleBudgetChange(level)}
            disabled={loading}
            className={`ce-budget-btn${budgetLevel === level ? ' active' : ''}`}
          >
            {BUDGET_LABELS[level]}
          </button>
        ))}
      </div>

      {loading && <CostSkeleton />}

      {!loading && error && (
        <div className="callout callout--danger ce-error">
          <p>Unable to load cost estimate.</p>
          <button type="button" onClick={() => fetchEstimate(budgetLevel)} className="btn-primary">
            Try again
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div className="ce-total">
            <p className="ce-total-label">Estimated Relocation Cost</p>
            <p className="ce-total-amount">{fmt(data.totals.usd)} USD</p>
            {data.totals.local && (
              <p className="ce-total-local">Approx. {data.totals.local.formatted}</p>
            )}
            <p className="ce-total-sources">
              Flight prices from live web search · Living costs researched from
              globalcostdata.com, numbeo.com
            </p>
          </div>

          <div className="ce-line-items">
            {lineItems.map(({ chartLabel, ...item }) => (
              <CostLineItem key={chartLabel} {...item} />
            ))}
          </div>

          <CostBreakdownChart
            data={lineItems.map((item) => ({ name: item.chartLabel, amount: item.amount }))}
          />

          <div className="callout callout--warning ce-tip">
            <p className="ce-tip-title">💡 Money-saving tip</p>
            <p>{data.savingsTip}</p>
          </div>

          <p className="fine-print">{data.disclaimer}</p>
        </>
      )}
    </div>
  )
}
