'use client'

import { ExternalLink } from 'lucide-react'
import type { JobLink } from '@/lib/types/jobs'

interface CuratedJobLinksProps {
  countryLinks: JobLink[]
  professionLinks: Omit<JobLink, 'categories'>[]
  caribbeanWideLinks: JobLink[]
  countryName: string
  profession: string
}

interface LinkCardProps {
  name: string
  url: string
  description: string
}

function LinkCard({ name, url, description }: LinkCardProps) {
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
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>
          {name}
        </div>
        <div
          style={{
            fontSize: '0.8rem',
            color: '#6b7280',
            marginTop: '0.2rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {description}
        </div>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          background: 'rgba(17,127,116,0.08)',
          color: '#117F74',
          border: '1px solid rgba(17,127,116,0.25)',
          borderRadius: '999px',
          padding: '0.35rem 0.85rem',
          fontSize: '0.8rem',
          fontWeight: 600,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Visit <ExternalLink size={11} />
      </a>
    </div>
  )
}

interface SubsectionProps {
  heading: string
  links: { name: string; url: string; description: string }[]
}

function Subsection({ heading, links }: SubsectionProps) {
  if (links.length === 0) return null
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <h3
        style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#6b7280',
          margin: '0 0 0.6rem',
        }}
      >
        {heading}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {links.map((l) => (
          <LinkCard key={l.url} name={l.name} url={l.url} description={l.description} />
        ))}
      </div>
    </div>
  )
}

export default function CuratedJobLinks({
  countryLinks,
  professionLinks,
  caribbeanWideLinks,
  countryName,
  profession,
}: CuratedJobLinksProps) {
  const hasAny =
    countryLinks.length > 0 ||
    professionLinks.length > 0 ||
    caribbeanWideLinks.length > 0

  if (!hasAny) return null

  return (
    <div
      style={{
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '1.25rem 1.5rem',
        marginTop: '1.5rem',
      }}
    >
      <h2
        style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          color: '#111827',
          margin: '0 0 1rem',
        }}
      >
        Browse Job Boards
      </h2>

      <Subsection
        heading={`${countryName} Job Boards`}
        links={countryLinks}
      />
      <Subsection
        heading={`${profession} Opportunities`}
        links={professionLinks}
      />
      <Subsection
        heading="Caribbean-Wide Boards"
        links={caribbeanWideLinks}
      />
    </div>
  )
}
