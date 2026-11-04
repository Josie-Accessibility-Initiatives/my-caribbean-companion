import { NextResponse } from 'next/server'
import { getExchangeRates } from '@/lib/exchange-rates'
import { apiError } from '@/lib/api'

export async function GET() {
  try {
    return NextResponse.json(await getExchangeRates())
  } catch {
    return apiError('Failed to fetch rates', 500)
  }
}
