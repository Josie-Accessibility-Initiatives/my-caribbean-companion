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

      <div className="cs-pills">
        {SUPPORTED_CURRENCIES.map((currency) => (
          <button
            type="button"
            key={currency.code}
            className={`cs-pill${
              selected === currency.code ? ' cs-pill-active' : ''
            }`}
            onClick={() => onChange(currency.code)}
            title={currency.name}
          >
            {currency.code}
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

