import { NextRequest, NextResponse } from 'next/server'
import { getCaribGovData } from '@/lib/external/caribgov'
import { COUNTRY_META } from '@/data/countryMeta'
import { handleRouteError, requireCountryParam } from '@/lib/api'
import type { CSMEDocumentsData } from '@/lib/types/documents'
import rawDocs from '@/data/csme-documents.json'

const csmeDocuments = rawDocs as unknown as CSMEDocumentsData

const DISCLAIMER =
  'Always verify information directly with the official government source before submitting documents. Requirements can change without notice.'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  if (searchParams.get('global') === 'true') {
    return NextResponse.json({ global: csmeDocuments.global, source: 'static' })
  }

  try {
    const country = requireCountryParam(searchParams)
    const category = searchParams.get('category')
    const caribgov = await getCaribGovData(country)

    return NextResponse.json({
      country: { code: country, name: COUNTRY_META[country].name },
      category: category ?? null,
      liveContacts: {
        competentAuthority: caribgov.competentAuthority,
        immigrationDept: caribgov.immigrationDept,
        allContacts: caribgov.contacts,
        source: caribgov.source,
        fetchedAt: caribgov.fetchedAt,
      },
      documents: {
        global: csmeDocuments.global,
        countrySpecific: csmeDocuments.by_country[country] ?? [],
        categorySpecific: category ? csmeDocuments.by_category[category] ?? [] : [],
      },
      lastVerified: '2025-01-01',
      disclaimer: DISCLAIMER,
    })
  } catch (err) {
    return handleRouteError(err, 'GET /api/documents', 'Failed to load documents.')
  }
}
