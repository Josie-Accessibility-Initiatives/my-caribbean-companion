'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'
import type { JobListing } from '@/lib/external/jsearch'

interface JobCardProps {
  job: JobListing
  userProfession?: string
}

const EMPLOYMENT_BADGES: Record<string, { label: string; bg: string; color: string }> = {
  FULLTIME:   { label: 'Full Time',   bg: '#dcfce7', color: '#166534' },
  PARTTIME:   { label: 'Part Time',   bg: '#fef9c3', color: '#854d0e' },
  CONTRACTOR: { label: 'Contract',    bg: '#dbeafe', color: '#1e40af' },
  INTERN:     { label: 'Internship',  bg: '#f3e8ff', color: '#6b21a8' },
}

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
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'Posted today'
  if (days === 1) return 'Posted 1 day ago'
  return `Posted ${days} days ago`
}

export default function JobCard({ job, userProfession }: JobCardProps) {
  const [expanded, setExpanded] = useState(false)

  const matchesProfession =
    userProfession != null &&
    job.title.toLowerCase().includes(userProfession.toLowerCase())

  const employmentKey = job.employmentType
    ? job.employmentType.toUpperCase().replace(/[^A-Z]/g, '')
    : null
  const badge = employmentKey ? EMPLOYMENT_BADGES[employmentKey] ?? null : null
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)
  const posted = daysAgo(job.postedAt)

  const shortDesc = job.description.slice(0, 200)
  const longDesc = job.description
  const canExpand = job.description.length > 200

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      {/* Top row: logo + title + company */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        {job.logo ? (
          <img
            src={job.logo}
            alt={job.company}
            width={40}
            height={40}
            style={{ borderRadius: '0.375rem', objectFit: 'contain', flexShrink: 0 }}
            onError={(e) => {
              const t = e.currentTarget
              t.style.display = 'none'
              const sib = t.nextElementSibling as HTMLElement | null
              if (sib) sib.style.display = 'flex'
            }}
          />
        ) : null}
        {/* Fallback initial circle — visible when no logo or img errors */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '0.375rem',
            background: '#e5e7eb',
            color: '#6b7280',
            fontWeight: 700,
            fontSize: '1rem',
            display: job.logo ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {job.company.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: '1rem',
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              flexWrap: 'wrap',
            }}
          >
            {matchesProfession && (
              <span
                title="Matches your profession"
                style={{ color: 'var(--color-primary)', fontSize: '0.95rem', lineHeight: 1 }}
              >
                ★
              </span>
            )}
            {job.title}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.1rem' }}>
            {job.company}
          </div>
        </div>
      </div>

      {/* Second row: location + badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
        {job.location && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.85rem',
              color: '#6b7280',
            }}
          >
            <MapPin size={13} />
            {job.location}
          </span>
        )}

        {badge && (
          <span
            style={{
              background: badge.bg,
              color: badge.color,
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
            }}
          >
            {badge.label}
          </span>
        )}

        {job.isRemote && (
          <span
            style={{
              background: '#ccfbf1',
              color: 'var(--color-primary-dark)',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
            }}
          >
            Remote
          </span>
        )}
      </div>

      {/* Salary row */}
      {salary && (
        <div style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)', fontWeight: 600 }}>
          {salary}
        </div>
      )}

      {/* Description */}
      <div style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.55 }}>
        {expanded || !canExpand ? (
          <>
            {longDesc}
            {canExpand && (
              <button
                type="button"
                onClick={() => setExpanded(false)}
                style={{
                  marginLeft: '0.4rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  padding: 0,
                }}
              >
                Show less
              </button>
            )}
          </>
        ) : (
          <div style={{ position: 'relative' }}>
            <div
              style={{
                overflow: 'hidden',
                maxHeight: '3.6rem',
                maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
              }}
            >
              {shortDesc}
            </div>
            <button
              type="button"
              onClick={() => setExpanded(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                padding: '0.25rem 0 0',
                display: 'block',
              }}
            >
              Read more
            </button>
          </div>
        )}
      </div>

      {/* Bottom row: posted date + apply button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid #f3f4f6',
        }}
      >
        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
          {posted ?? ''}
        </span>

        {job.applyLink && (
          <a
            href={job.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: 'var(--color-primary)',
              color: '#ffffff',
              borderRadius: '999px',
              padding: '0.4rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Apply Now →
          </a>
        )}
      </div>
    </div>
  )
}
