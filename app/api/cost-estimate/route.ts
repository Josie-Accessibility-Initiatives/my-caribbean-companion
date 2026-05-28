import { ApiError, apiError, apiSuccess, readDataFile } from '@/lib/api'
import { COUNTRY_META } from '@/data/countryMeta'
import { getFlightEstimate, getCostOfLiving } from '@/lib/cost-search'
import { convertUSDToLocal } from '@/lib/exchange-rates'
import { extractJSON } from '@/lib/ai'

type BudgetLevel = 'budget' | 'mid' | 'comfortable'

type CostEstimatesData = {
  defaults: {
    documents: {
      skillsCertificate: number
      policeCertificate: number
      medicalCertificate: number
      notarization: number
      translation: number
      total: number
      note: string
    }
    shipping: {
      carryon: number
      extraBaggage: number
      smallLoad: number
      mediumLoad: number
      note: string
    }
    housing: {
      depositMonths: number
      temporaryNights: number
      note: string
    }
    emergency: {
      recommendedMonths: number
      note: string
    }
  }
  countries: Record<string, {
    temporaryAccommodationPerNight: number
    bookingComLink: string
  }>
}

function validateRequest(body: unknown): {
  fromCountry: string
  toCountry: string
  category: string | undefined
  budgetLevel: BudgetLevel
} {
  if (!body || typeof body !== 'object') {
    throw new ApiError('Request body is required.', 400)
  }

  const b = body as Record<string, unknown>

  const fromCountry =
    typeof b.fromCountry === 'string' ? b.fromCountry.trim().toUpperCase() : ''
  const toCountry =
    typeof b.toCountry === 'string' ? b.toCountry.trim().toUpperCase() : ''

  if (!fromCountry) {
    throw new ApiError('fromCountry is required.', 400)
  }
  if (!toCountry) {
    throw new ApiError('toCountry is required.', 400)
  }
  if (fromCountry === toCountry) {
    throw new ApiError(
      'fromCountry and toCountry cannot be the same.',
      400
    )
  }

  if (!COUNTRY_META[fromCountry]) {
    throw new ApiError(
      `Unknown country code: ${fromCountry}. Must be a CARICOM member state.`,
      400
    )
  }
  if (!COUNTRY_META[toCountry]) {
    throw new ApiError(
      `Unknown country code: ${toCountry}. Must be a CARICOM member state.`,
      400
    )
  }

  const rawBudget = b.budgetLevel
  const validLevels: BudgetLevel[] = ['budget', 'mid', 'comfortable']
  const budgetLevel: BudgetLevel =
    typeof rawBudget === 'string' &&
    validLevels.includes(rawBudget as BudgetLevel)
      ? (rawBudget as BudgetLevel)
      : 'mid'

  const category =
    typeof b.category === 'string' && b.category.trim()
      ? b.category.trim()
      : undefined

  return { fromCountry, toCountry, category, budgetLevel }
}

async function getSavingsTip(
  countryName: string,
  budgetLevel: BudgetLevel
): Promise<string> {
  const fallback =
    'Open a local bank account as soon as you arrive to avoid ' +
    'international transaction fees on your first month of expenses.'

  try {
    const prompt =
      `Give one short practical money-saving tip (2 sentences max) ` +
      `for someone relocating to ${countryName} under CSME on a ` +
      `${budgetLevel} budget. Be specific to the Caribbean context. ` +
      `JSON only: { "tip": "..." }`

    const raw = await extractJSON(prompt)
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())

    if (typeof parsed?.tip === 'string' && parsed.tip.trim()) {
      return parsed.tip.trim()
    }
    return fallback
  } catch {
    return fallback
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const { fromCountry, toCountry, budgetLevel } = validateRequest(body)

    const fromMeta = COUNTRY_META[fromCountry]
    const toMeta = COUNTRY_META[toCountry]

    // Step 2 — Load all data in parallel
    const [flightEstimate, costOfLiving, exchangeRate, costEstimates] =
      await Promise.all([
        getFlightEstimate(
          fromCountry,
          fromMeta.stats.capital,
          toCountry,
          toMeta.stats.capital
        ),
        getCostOfLiving(
          toCountry,
          toMeta.name,
          toMeta.stats.searchCity
        ),
        convertUSDToLocal(1, toCountry),
        readDataFile<CostEstimatesData>('cost-estimates.json'),
      ])

    // Step 3 — Calculate breakdown
    const { defaults } = costEstimates
    const countryData = costEstimates.countries[toCountry]

    const rentMin = costOfLiving.rentOneBed.min
    const rentMax = costOfLiving.rentOneBed.max
    const rent =
      budgetLevel === 'budget'
        ? rentMin
        : budgetLevel === 'comfortable'
        ? rentMax
        : Math.round((rentMin + rentMax) / 2)

    const flightCost =
      budgetLevel === 'budget'
        ? flightEstimate.minPrice
        : budgetLevel === 'comfortable'
        ? flightEstimate.maxPrice
        : Math.round(
            (flightEstimate.minPrice + flightEstimate.maxPrice) / 2
          )

    const tempAccommodation =
      countryData.temporaryAccommodationPerNight *
      defaults.housing.temporaryNights

    const housingDeposit = rent * defaults.housing.depositMonths

    const documentFees = defaults.documents.total

    const shipping =
      budgetLevel === 'budget'
        ? defaults.shipping.extraBaggage
        : budgetLevel === 'comfortable'
        ? defaults.shipping.mediumLoad
        : defaults.shipping.smallLoad

    const firstMonthLiving = costOfLiving.monthlyTotal

    const emergencyBuffer =
      costOfLiving.monthlyTotal * defaults.emergency.recommendedMonths

    const total =
      flightCost +
      housingDeposit +
      tempAccommodation +
      documentFees +
      shipping +
      firstMonthLiving +
      emergencyBuffer

    // Step 4 — Gemini savings tip (non-blocking fallback handled inside)
    const savingsTip = await getSavingsTip(toMeta.name, budgetLevel)

    // Step 5 — Build Google Flights deep link
    const googleFlightsUrl =
      `https://www.google.com/flights#flt=` +
      `${fromMeta.stats.airportCode}.` +
      `${toMeta.stats.airportCode}`

    // Step 6 — Build local currency total
    const localTotal = exchangeRate
      ? {
          amount: Math.round(total * exchangeRate.amount),
          formatted: `${exchangeRate.symbol}${Math.round(
            total * exchangeRate.amount
          ).toLocaleString()}`,
          currency: exchangeRate.currency,
        }
      : null

    const shippingNote =
      budgetLevel === 'budget'
        ? 'Extra baggage only'
        : budgetLevel === 'comfortable'
        ? 'Medium shipping load (furniture and boxes)'
        : 'Small load (boxes only)'

    return apiSuccess({
      fromCountry: {
        code: fromCountry,
        name: fromMeta.name,
        capital: fromMeta.stats.capital,
      },
      toCountry: {
        code: toCountry,
        name: toMeta.name,
        capital: toMeta.stats.capital,
        currency: toMeta.stats.currency,
      },
      budgetLevel,
      breakdown: {
        flights: {
          amount: flightCost,
          min: flightEstimate.minPrice,
          max: flightEstimate.maxPrice,
          source: flightEstimate.source,
          googleFlightsUrl,
          airlines: flightEstimate.airlines,
        },
        housingDeposit: {
          amount: housingDeposit,
          note: `${defaults.housing.depositMonths} months deposit at $${rent}/month`,
        },
        temporaryAccommodation: {
          amount: tempAccommodation,
          nights: defaults.housing.temporaryNights,
          perNight: countryData.temporaryAccommodationPerNight,
          bookingComUrl: countryData.bookingComLink,
        },
        documentFees: {
          amount: documentFees,
          breakdown: {
            skillsCertificate: defaults.documents.skillsCertificate,
            policeCertificate: defaults.documents.policeCertificate,
            medicalCertificate: defaults.documents.medicalCertificate,
            notarization: defaults.documents.notarization,
            translation: defaults.documents.translation,
          },
        },
        shipping: {
          amount: shipping,
          note: shippingNote,
        },
        firstMonthLiving: {
          amount: firstMonthLiving,
          breakdown: {
            rent,
            groceries: costOfLiving.monthlyGroceries,
            transport: costOfLiving.monthlyTransport,
            utilities: costOfLiving.monthlyUtilities,
          },
        },
        emergencyBuffer: {
          amount: Math.round(emergencyBuffer),
          months: defaults.emergency.recommendedMonths,
        },
      },
      totals: {
        usd: Math.round(total),
        local: localTotal,
      },
      savingsTip,
      disclaimer:
        'All estimates are approximate and based on regional averages. ' +
        'Actual costs will vary. Verify current fees with official sources ' +
        'before making financial decisions.',
      generatedAt: new Date().toISOString(),
    })
  } catch (err) {
    if (err instanceof ApiError) {
      return apiError(err.message, err.status)
    }
    console.error('POST /api/cost-estimate:', err)
    return apiError('Failed to generate cost estimate.', 500)
  }
}
