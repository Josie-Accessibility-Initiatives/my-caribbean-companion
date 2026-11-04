'use client'

import { LinkCard } from '@/components/ui/LinkCard'
import type { CuratedJobLinks as CuratedJobLinksData } from '@/lib/types/jobs'

interface CuratedJobLinksProps extends CuratedJobLinksData {
  countryName: string
  profession: string
}

function Subsection({
  heading,
  links,
}: {
  heading: string
  links: { name: string; url: string; description: string }[]
}) {
  if (links.length === 0) return null
  return (
    <div className="mb-1">
      <h3 className="section-label">{heading}</h3>
      <div className="stack-sm">
        {links.map((l) => (
          <LinkCard key={l.url} title={l.name} description={l.description} href={l.url} />
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
  if (!countryLinks.length && !professionLinks.length && !caribbeanWideLinks.length) {
    return null
  }

  return (
    <div className="card card--muted mt-1">
      <h2 className="card-heading">Browse Job Boards</h2>
      <Subsection heading={`${countryName} Job Boards`} links={countryLinks} />
      <Subsection heading={`${profession} Opportunities`} links={professionLinks} />
      <Subsection heading="Caribbean-Wide Boards" links={caribbeanWideLinks} />
    </div>
  )
}
