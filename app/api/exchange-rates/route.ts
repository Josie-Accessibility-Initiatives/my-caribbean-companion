import { getExchangeRates } from '@/lib/exchange-rates'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const rates = await getExchangeRates()
    return NextResponse.json(rates)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch rates' },
      { status: 500 }
    )
  }
}
