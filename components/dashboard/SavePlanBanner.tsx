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
    <div role="region" aria-label="Save your plan" className="save-banner">
      <Bookmark size={22} className="save-banner-icon" aria-hidden="true" />

      <div className="save-banner-body">
        <h3>Save your plan</h3>
        <p>
          Create a free account to save your progress, sync your checklist across
          devices, and access your plan anytime.
        </p>
        <div className="row">
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
        className="save-banner-close"
      >
        <X size={16} />
      </button>
    </div>
  );
}
