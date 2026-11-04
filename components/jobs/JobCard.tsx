'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { Badge, type BadgeColors } from '@/components/ui/Badge'
import { PillLink } from '@/components/ui/LinkCard'
import type { JobListing } from '@/lib/external/jsearch'

interface JobCardProps {
  job: JobListing
  userProfession?: string
}

const EMPLOYMENT_BADGES: Record<string, BadgeColors & { label: string }> = {
  FULLTIME:   { label: 'Full Time',  bg: '#dcfce7', color: '#166534' },
  PARTTIME:   { label: 'Part Time',  bg: '#fef9c3', color: '#854d0e' },
  CONTRACTOR: { label: 'Contract',   bg: '#dbeafe', color: '#1e40af' },
  INTERN:     { label: 'Internship', bg: '#f3e8ff', color: '#6b21a8' },
}

const REMOTE_BADGE: BadgeColors = { bg: '#ccfbf1', color: 'var(--color-primary-dark)' }
const PREVIEW_LENGTH = 200

function formatSalary(min: number | null, max: number | null, currency: string | null): string | null {
  if (min == null && max == null) return null
  const sym = currency ? `${currency} ` : '$'
  const fmt = (n: number) => n.toLocaleString()
  if (min != null && max != null) return `${sym}${fmt(min)} – ${sym}${fmt(max)} / year`
  if (min != null) return `From ${sym}${fmt(min)} / year`
  return `Up to ${sym}${fmt(max!)} / year`
}

function daysAgo(iso: string | null): string | null {
  if (!iso) return null
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days === 0) return 'Posted today'
  if (days === 1) return 'Posted 1 day ago'
  return `Posted ${days} days ago`
}

function CompanyLogo({ src, company }: { src: string | null; company: string }) {
  const [failed, setFailed] = useState(false)
  if (src && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={company} className="job-logo" onError={() => setFailed(true)} />
  }
  return <div className="job-logo-fallback">{company.charAt(0).toUpperCase()}</div>
}

export default function JobCard({ job, userProfession }: JobCardProps) {
  const [expanded, setExpanded] = useState(false)

  const matchesProfession =
    userProfession != null && job.title.toLowerCase().includes(userProfession.toLowerCase())
  const employmentKey = job.employmentType?.toUpperCase().replace(/[^A-Z]/g, '')
  const badge = employmentKey ? EMPLOYMENT_BADGES[employmentKey] : undefined
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)
  const posted = daysAgo(job.postedAt)
  const canExpand = job.description.length > PREVIEW_LENGTH

  return (
    <div className="job-card">
      <div className="job-header">
        <CompanyLogo src={job.logo} company={job.company} />
        <div className="flex-1">
          <div className="job-title">
            {matchesProfession && (
              <span className="job-match-star" title="Matches your profession">★</span>
            )}
            {job.title}
          </div>
          <div className="job-company">{job.company}</div>
        </div>
      </div>

      <div className="row">
        {job.location && (
          <span className="job-location">
            <MapPin size={13} />
            {job.location}
          </span>
        )}
        {badge && <Badge colors={badge}>{badge.label}</Badge>}
        {job.isRemote && <Badge colors={REMOTE_BADGE}>Remote</Badge>}
      </div>

      {salary && <div className="job-salary">{salary}</div>}

      <div className="job-desc">
        {expanded || !canExpand ? (
          <>
            {job.description}
            {canExpand && (
              <button type="button" className="link-button" onClick={() => setExpanded(false)}>
                &nbsp;Show less
              </button>
            )}
          </>
        ) : (
          <>
            <div className="job-desc-preview">{job.description.slice(0, PREVIEW_LENGTH)}</div>
            <button type="button" className="link-button" onClick={() => setExpanded(true)}>
              Read more
            </button>
          </>
        )}
      </div>

      <div className="row-between job-footer">
        <span className="text-xs text-subtle">{posted ?? ''}</span>
        {job.applyLink && (
          <PillLink href={job.applyLink} variant="solid" icon={false}>
            Apply Now →
          </PillLink>
        )}
      </div>
    </div>
  )
}
