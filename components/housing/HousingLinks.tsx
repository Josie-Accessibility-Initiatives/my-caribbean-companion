'use client'

import { Home, Building, ExternalLink, Users } from 'lucide-react'
import type { FacebookGroup, RealEstateLink, RegionalLink } from '@/lib/types/housing'

interface TemporaryOption {
  name: string
  pricePerNight: number | null
  url: string
  type: string
}

interface HousingLinksProps {
  facebookGroups: FacebookGroup[]
  realEstateLinks: RealEstateLink[]
  bookingComUrl: string | null
  regional: RegionalLink[]
  countryName: string
  temporaryOptions: TemporaryOption[]
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontSize: '0.78rem',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
        color: '#6b7280',
        margin: '0 0 0.65rem',
      }}
    >
      {children}
    </h3>
  )
}

function LinkRow({
  href,
  label,
  style: btnStyle,
}: {
  href: string
  label: string
  style?: React.CSSProperties
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        borderRadius: '999px',
        padding: '0.35rem 0.85rem',
        fontSize: '0.8rem',
        fontWeight: 600,
        textDecoration: 'none',
        whiteSpace: 'nowrap' as const,
        flexShrink: 0,
        background: 'var(--color-primary-soft)',
        color: 'var(--color-primary)',
        border: '1px solid var(--color-primary-border)',
        ...btnStyle,
      }}
    >
      {label} <ExternalLink size={11} />
    </a>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '0.625rem',
        padding: '0.9rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      {children}
    </div>
  )
}

export default function HousingLinks({
  facebookGroups,
  realEstateLinks,
  bookingComUrl,
  regional,
  countryName: _countryName,
  temporaryOptions,
}: HousingLinksProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* ── 1. Temporary Accommodation ── */}
      <div>
        <SectionHeading>Temporary Accommodation</SectionHeading>

        {bookingComUrl && (
          <a
            href={bookingComUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'var(--color-primary)',
              color: '#ffffff',
              borderRadius: '999px',
              padding: '0.55rem 1.25rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              textDecoration: 'none',
              marginBottom: temporaryOptions.length > 0 ? '0.85rem' : 0,
            }}
          >
            Browse on Booking.com →
          </a>
        )}

        {temporaryOptions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {temporaryOptions.map((opt) => (
              <Card key={opt.url}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>
                    {opt.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.15rem' }}>
                    {opt.type.charAt(0).toUpperCase() + opt.type.slice(1)}
                    {opt.pricePerNight != null && (
                      <span style={{ marginLeft: '0.4rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                        · ${opt.pricePerNight}/night
                      </span>
                    )}
                  </div>
                </div>
                <LinkRow href={opt.url} label="View" />
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── 2. Facebook Housing Groups ── */}
      {facebookGroups.length > 0 && (
        <div>
          <SectionHeading>Facebook Housing Groups</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {facebookGroups.map((g) => (
              <Card key={g.url}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>
                      {g.name}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        background: '#dbeafe',
                        color: '#1e40af',
                        whiteSpace: 'nowrap' as const,
                      }}
                    >
                      <Users size={10} />
                      {g.members}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: '#6b7280',
                      marginTop: '0.2rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' as const,
                    }}
                  >
                    {g.description}
                  </div>
                </div>
                <LinkRow
                  href={g.url}
                  label="Join Group"
                  style={{
                    background: 'rgba(24,119,242,0.08)',
                    color: '#1877f2',
                    border: '1px solid rgba(24,119,242,0.25)',
                  }}
                />
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. Real Estate Agencies ── */}
      {realEstateLinks.length > 0 && (
        <div>
          <SectionHeading>Real Estate Agencies</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {realEstateLinks.map((r) => (
              <Card key={r.url}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>
                    {r.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: '#6b7280',
                      marginTop: '0.2rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' as const,
                    }}
                  >
                    {r.description}
                  </div>
                </div>
                <LinkRow href={r.url} label="Browse Listings" />
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. Caribbean-Wide Resources ── */}
      {regional.length > 0 && (
        <div>
          <SectionHeading>Caribbean-Wide Resources</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {regional.map((res) => (
              <Card key={res.url}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '0.5rem',
                      background: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {res.icon === 'building' ? (
                      <Building size={15} color="#6b7280" />
                    ) : (
                      <Home size={15} color="#6b7280" />
                    )}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>
                      {res.name}
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: '#6b7280',
                        marginTop: '0.15rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap' as const,
                      }}
                    >
                      {res.description}
                    </div>
                  </div>
                </div>
                <LinkRow href={res.url} label="Visit" />
              </Card>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
