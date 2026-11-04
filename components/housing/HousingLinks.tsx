'use client'

import type { ReactNode } from 'react'
import { Home, Building, Users } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { LinkCard, PillLink } from '@/components/ui/LinkCard'
import { capitalize } from '@/lib/format'
import type {
  FacebookGroup,
  RealEstateLink,
  RegionalLink,
  TemporaryOption,
} from '@/lib/types/housing'

interface HousingLinksProps {
  facebookGroups: FacebookGroup[]
  realEstateLinks: RealEstateLink[]
  bookingComUrl: string | null
  regional: RegionalLink[]
  temporaryOptions: TemporaryOption[]
}

function LinkGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="section-label">{title}</h3>
      <div className="stack-sm">{children}</div>
    </div>
  )
}

export default function HousingLinks({
  facebookGroups,
  realEstateLinks,
  bookingComUrl,
  regional,
  temporaryOptions,
}: HousingLinksProps) {
  return (
    <div className="stack-xl">
      <LinkGroup title="Temporary Accommodation">
        {bookingComUrl && (
          <div>
            <PillLink href={bookingComUrl} variant="solid" icon={false} className="pill-link--lg">
              Browse on Booking.com →
            </PillLink>
          </div>
        )}
        {temporaryOptions.map((opt) => (
          <LinkCard
            key={opt.url}
            title={opt.name}
            href={opt.url}
            actionLabel="View"
            description={
              <>
                {capitalize(opt.type)}
                {opt.pricePerNight != null && (
                  <span className="text-primary"> · ${opt.pricePerNight}/night</span>
                )}
              </>
            }
          />
        ))}
      </LinkGroup>

      {facebookGroups.length > 0 && (
        <LinkGroup title="Facebook Housing Groups">
          {facebookGroups.map((g) => (
            <LinkCard
              key={g.url}
              title={g.name}
              description={g.description}
              href={g.url}
              actionLabel="Join Group"
              variant="facebook"
              meta={
                <Badge size="sm" colors={{ bg: '#dbeafe', color: '#1e40af' }}>
                  <Users size={10} />
                  {g.members}
                </Badge>
              }
            />
          ))}
        </LinkGroup>
      )}

      {realEstateLinks.length > 0 && (
        <LinkGroup title="Real Estate Agencies">
          {realEstateLinks.map((r) => (
            <LinkCard
              key={r.url}
              title={r.name}
              description={r.description}
              href={r.url}
              actionLabel="Browse Listings"
            />
          ))}
        </LinkGroup>
      )}

      {regional.length > 0 && (
        <LinkGroup title="Caribbean-Wide Resources">
          {regional.map((res) => (
            <LinkCard
              key={res.url}
              title={res.name}
              description={res.description}
              href={res.url}
              leading={res.icon === 'building' ? <Building size={15} /> : <Home size={15} />}
            />
          ))}
        </LinkGroup>
      )}
    </div>
  )
}
