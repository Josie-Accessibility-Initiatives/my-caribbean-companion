import { getCached, setCached } from '@/lib/cache'

const CACHE_TTL_HOURS = 24 * 7 // 7 days
const BASE_URL = 'https://caribgov.com/api'

// Full country names as used by CaribGov (verified against live API)
const CARIBGOV_COUNTRIES: Record<string, string> = {
  TT: 'Trinidad and Tobago',
  BB: 'Barbados',
  JM: 'Jamaica',
  GY: 'Guyana',
  LC: 'Saint Lucia',
  GD: 'Grenada',
  DM: 'Dominica',
  VC: 'Saint Vincent and the Grenadines',
  KN: 'Saint Kitts and Nevis',
  AG: 'Antigua and Barbuda',
  SR: 'Suriname',
  BZ: 'Belize',
}

// Raw shape returned by GET /api/contacts
type RawContact = {
  id: string
  name: string
  department: string | null
  country: string
  phone: string | null
  email: string | null
  alternateEmails: string[] | null
  alternatePhones: string[] | null
  website: string | null
  address: string | null
  ministerName: string | null
  permanentSecretaryName: string | null
  permanentSecretaryEmail: string | null
  permanentSecretaryPhone: string | null
  ministryType: string
  isActive: boolean
  lastVerified: string | null
  validationStatus: string
}

export type CaribGovContact = {
  ministry: string
  officer: string | null
  title: string | null
  email: string | null
  phone: string | null
  website: string | null
  address: string | null
  type: 'immigration' | 'labour' | 'csme' | 'other'
}

export type CaribGovData = {
  countryCode: string
  countryName: string
  contacts: CaribGovContact[]
  competentAuthority: CaribGovContact | null
  immigrationDept: CaribGovContact | null
  source: 'caribgov' | 'fallback'
  fetchedAt: string
}

async function caribgovFetch(endpoint: string): Promise<unknown> {
  const key = process.env.CARIBGOV_API_KEY
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    // Server-side only — no need to cache at the fetch layer
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error(`CaribGov API error: ${response.status}`)
  }
  return response.json()
}

// Classification by ministry name — ministryType field is unreliable across countries.
// Verified against live data: TT Labour → type "public-service", JM Labour → "national-security".
function classifyContact(name: string): CaribGovContact['type'] {
  const n = name.toLowerCase()
  if (n.includes('immigration')) return 'immigration'
  if (n.includes('csme')) return 'csme'
  if (n.includes('labour') || n.includes('labor')) return 'labour'
  return 'other'
}

function isRelevant(type: CaribGovContact['type'], name: string): boolean {
  if (type !== 'other') return true
  // Immigration is sometimes housed under Home Affairs or National Security
  const n = name.toLowerCase()
  return (
    n.includes('caricom') ||
    n.includes('national security') ||
    n.includes('home affairs')
  )
}

function toCaribGovContact(raw: RawContact): CaribGovContact {
  const type = classifyContact(raw.name)
  return {
    ministry: raw.name,
    officer: raw.ministerName ?? raw.permanentSecretaryName ?? null,
    title: raw.department ?? null,
    email: raw.email,
    phone: raw.phone,
    website: raw.website,
    address: raw.address,
    type,
  }
}

function parseContacts(data: unknown): CaribGovContact[] {
  if (!data || typeof data !== 'object' || !Array.isArray((data as { data?: unknown }).data)) {
    return []
  }
  const rows = (data as { data: RawContact[] }).data
  return rows
    .filter((r) => r.isActive)
    .map(toCaribGovContact)
    .filter((c) => isRelevant(c.type, c.ministry))
}

function pickCompetentAuthority(contacts: CaribGovContact[]): CaribGovContact | null {
  return (
    contacts.find((c) => c.type === 'csme') ??
    contacts.find((c) => c.type === 'labour') ??
    contacts.find((c) => c.ministry.toLowerCase().includes('caricom')) ??
    null
  )
}

function pickImmigrationDept(contacts: CaribGovContact[]): CaribGovContact | null {
  const n = (c: CaribGovContact) => c.ministry.toLowerCase()
  return (
    contacts.find((c) => c.type === 'immigration') ??
    contacts.find((c) => n(c).includes('home affairs')) ??
    contacts.find((c) => n(c).includes('national security')) ??
    null
  )
}

export async function getCaribGovData(countryCode: string): Promise<CaribGovData> {
  const cacheKey = `caribgov:${countryCode}`
  const cached = await getCached<CaribGovData>(cacheKey)
  if (cached) return cached

  const countryName = CARIBGOV_COUNTRIES[countryCode]
  if (!countryName) return fallback(countryCode)

  try {
    const data = await caribgovFetch(
      `/contacts?country=${encodeURIComponent(countryName)}`
    )
    const contacts = parseContacts(data)

    const result: CaribGovData = {
      countryCode,
      countryName,
      contacts,
      competentAuthority: pickCompetentAuthority(contacts),
      immigrationDept: pickImmigrationDept(contacts),
      source: 'caribgov',
      fetchedAt: new Date().toISOString(),
    }

    await setCached(cacheKey, result, CACHE_TTL_HOURS)
    return result
  } catch (error) {
    console.error(`CaribGov fetch failed for ${countryCode}:`, error)
    return fallback(countryCode, countryName)
  }
}

function fallback(countryCode: string, countryName?: string): CaribGovData {
  return {
    countryCode,
    countryName: countryName ?? countryCode,
    contacts: [],
    competentAuthority: null,
    immigrationDept: null,
    source: 'fallback',
    fetchedAt: new Date().toISOString(),
  }
}
