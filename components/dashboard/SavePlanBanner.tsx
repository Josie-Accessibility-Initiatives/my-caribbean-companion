'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bookmark, X } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

export default function SavePlanBanner() {
  const { user, loading } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (loading || user || dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Save your plan"
      style={{
        position: 'relative',
        background: 'var(--color-primary-soft)',
        borderLeft: '4px solid var(--color-primary)',
        borderRadius: '0.5rem',
        padding: '16px 20px',
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
      }}
    >
      <Bookmark
        size={22}
        color="var(--color-primary)"
        style={{ flexShrink: 0, marginTop: 2 }}
        aria-hidden="true"
      />

      <div style={{ flex: 1, paddingRight: '1.75rem' }}>
        <h3
          style={{
            margin: 0,
            marginBottom: '0.25rem',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#0f172a',
          }}
        >
          Save your plan
        </h3>
        <p
          style={{
            margin: 0,
            marginBottom: '0.75rem',
            fontSize: '0.9rem',
            color: '#374151',
            lineHeight: 1.5,
          }}
        >
          Create a free account to save your progress, sync your checklist across
          devices, and access your plan anytime.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link href="/signup" className="nav-primary-btn">
            Create Account
          </Link>
          <Link href="/login" className="nav-secondary-btn">
            Log in
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'transparent',
          border: 'none',
          color: 'var(--color-primary)',
          cursor: 'pointer',
          padding: 4,
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
