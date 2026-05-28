'use client'

import { SUPPORTED_CURRENCIES } from '@/lib/currency'

interface CurrencySelectorProps {
  selected: string
  onChange: (currencyCode: string) => void
  rates: Record<string, number> | null
}

export default function CurrencySelector({
  selected,
  onChange,
  rates,
}: CurrencySelectorProps) {
  const selectedRate = selected !== 'USD' ? rates?.[selected] : undefined

  return (
    <div className="cs-wrap">
      <style>{CS_STYLES}</style>

      <div className="cs-pills">
        {SUPPORTED_CURRENCIES.map((currency) => (
          <button
            key={currency.code}
            className={`cs-pill${
              selected === currency.code ? ' cs-pill-active' : ''
            }`}
            onClick={() => onChange(currency.code)}
            title={currency.name}
          >
            <span className="cs-flag">{currency.flag}</span>
            <span className="cs-code">{currency.code}</span>
          </button>
        ))}
      </div>

      <div className="cs-rate-row">
        {selected !== 'USD' && (
          rates === null ? (
            <span className="cs-rate-loading">Exchange rates loading…</span>
          ) : selectedRate ? (
            <span className="cs-rate-text">
              1 USD = {selectedRate.toFixed(2)} {selected}
            </span>
          ) : (
            <span className="cs-rate-loading">Rate unavailable for {selected}</span>
          )
        )}
      </div>
    </div>
  )
}

const CS_STYLES = `
.cs-wrap {
  margin-bottom: 16px;
}

.cs-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cs-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  background: #fff;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  transition: all 0.12s;
  line-height: 1;
}

.cs-pill:hover {
  background: #E1F5EE;
  border-color: #1D9E75;
  color: #0f766e;
}

.cs-pill-active {
  background: #1D9E75;
  border-color: #1D9E75;
  color: #fff;
}

.cs-pill-active:hover {
  background: #178a64;
  border-color: #178a64;
  color: #fff;
}

.cs-flag {
  font-size: 14px;
  line-height: 1;
}

.cs-code {
  letter-spacing: 0.03em;
}

.cs-rate-row {
  min-height: 20px;
  margin-top: 6px;
}

.cs-rate-text {
  font-size: 12.5px;
  color: #6b7280;
}

.cs-rate-loading {
  font-size: 12.5px;
  color: #9ca3af;
  font-style: italic;
}
`
