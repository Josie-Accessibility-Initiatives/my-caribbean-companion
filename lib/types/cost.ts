export type BudgetLevel = 'budget' | 'mid' | 'comfortable'

export const BUDGET_LEVELS: BudgetLevel[] = ['budget', 'mid', 'comfortable']

/** Whether a figure came from a live web search or a static fallback. */
export type DataSource = 'tavily' | 'fallback'

/** Response body of POST /api/cost-estimate */
export type CostEstimateResponse = {
  fromCountry: { code: string; name: string; capital: string }
  toCountry: { code: string; name: string; capital: string; currency: string }
  budgetLevel: BudgetLevel
  breakdown: {
    flights: {
      amount: number
      min: number
      max: number
      source: DataSource
      googleFlightsUrl: string
      airlines: string[]
    }
    housingDeposit: { amount: number; note: string }
    temporaryAccommodation: {
      amount: number
      nights: number
      perNight: number
      bookingComUrl: string
    }
    documentFees: {
      amount: number
      breakdown: {
        skillsCertificate: number
        policeCertificate: number
        medicalCertificate: number
        notarization: number
        translation: number
      }
    }
    shipping: { amount: number; note: string }
    firstMonthLiving: {
      amount: number
      breakdown: {
        rent: number
        groceries: number
        transport: number
        utilities: number
      }
    }
    emergencyBuffer: { amount: number; months: number }
  }
  totals: {
    usd: number
    local: { amount: number; formatted: string; currency: string } | null
  }
  savingsTip: string
  disclaimer: string
  generatedAt: string
}
