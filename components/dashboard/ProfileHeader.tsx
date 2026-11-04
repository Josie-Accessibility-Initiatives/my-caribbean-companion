"use client";

import Link from "next/link";
import { Briefcase, MapPin, Plane, Pencil } from "lucide-react";
import { categoryLabel, countryName } from "@/lib/constants";
import type { Profile } from "@/lib/types/plan";

type ProfileHeaderProps = {
  profile: Profile | null;
  email: string | null;
  planCount: number;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function ProfileHeader({ profile, email, planCount }: ProfileHeaderProps) {
  const name = profile?.full_name?.trim() || email || "Traveller";
  const firstName = profile?.full_name?.trim().split(/\s+/)[0] ?? null;
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : null;

  const facts = [
    { icon: MapPin, label: "From", value: countryName(profile?.home_country) },
    { icon: Plane, label: "Living in", value: countryName(profile?.current_country) },
    { icon: Briefcase, label: "Profession", value: categoryLabel(profile?.profession) },
  ].filter((fact) => fact.value);

  // Name only the fields that are actually missing
  const missing = [
    !profile?.home_country && "home country",
    !profile?.profession && "profession",
  ].filter(Boolean) as string[];
  const missingHint = missing.length
    ? `Add your ${missing.join(" and ")} so we can pre-fill new plans for you.`
    : null;

  return (
    <section className="profile-header">
      <div className="profile-avatar" aria-hidden="true">
        {initials(name) || "?"}
      </div>

      <div className="profile-header-body">
        <p className="dashboard-eyebrow no-margin">My dashboard</p>
        <h1 className="profile-header-name">
          Welcome back{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="profile-header-meta">
          {planCount} saved plan{planCount === 1 ? "" : "s"}
          {memberSince ? ` · Member since ${memberSince}` : ""}
        </p>

        {facts.length > 0 && (
          <ul className="profile-facts">
            {facts.map(({ icon: Icon, label, value }) => (
              <li key={label}>
                <Icon size={14} aria-hidden="true" />
                <span className="profile-fact-label">{label}</span> {value}
              </li>
            ))}
          </ul>
        )}

        {missingHint && (
          <Link href="/dashboard/profile" className="profile-header-hint">
            {missingHint}
          </Link>
        )}
      </div>

      <Link href="/dashboard/profile" className="btn-secondary profile-edit-btn">
        <Pencil size={14} aria-hidden="true" /> Edit profile
      </Link>
    </section>
  );
}
