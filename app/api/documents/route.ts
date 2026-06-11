import { NextRequest, NextResponse } from 'next/server'
import { getCaribGovData } from '@/lib/external/caribgov'
import { COUNTRY_META } from '@/data/countryMeta'
import type { CSMEDocumentsData } from '@/lib/types/documents'
import rawDocs from '@/data/csme-documents.json'

const csmeDocuments = rawDocs as unknown as CSMEDocumentsData

const DISCLAIMER =
  'Always verify information directly with the official government source before submitting documents. Requirements can change without notice.'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const country = searchParams.get('country')
  const category = searchParams.get('category')
  const globalOnly = searchParams.get('global')

  if (globalOnly === 'true') {
    return NextResponse.json({
      global: csmeDocuments.global,
      source: 'static',
    })
  }

  if (!country) {
    return NextResponse.json(
      { error: 'country parameter required' },
      { status: 400 }
    )
  }

  if (!COUNTRY_META[country]) {
    return NextResponse.json(
      { error: 'Invalid country code' },
      { status: 400 }
    )
  }

  const caribgovData = await getCaribGovData(country)

  const countryDocs = csmeDocuments.by_country[country] ?? []

  const categoryDocs = category
    ? csmeDocuments.by_category[category] ?? []
    : []

  return NextResponse.json({
    country: {
      code: country,
      name: COUNTRY_META[country].name,
    },
    category: category ?? null,
    liveContacts: {
      competentAuthority: caribgovData.competentAuthority,
      immigrationDept: caribgovData.immigrationDept,
      allContacts: caribgovData.contacts,
      source: caribgovData.source,
      fetchedAt: caribgovData.fetchedAt,
    },
    documents: {
      global: csmeDocuments.global,
      countrySpecific: countryDocs,
      categorySpecific: categoryDocs,
    },
    lastVerified: '2025-01-01',
    disclaimer: DISCLAIMER,
  })
}
