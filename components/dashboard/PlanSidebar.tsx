"use client";

import Link from "next/link";
import type { PlanInput } from "@/lib/types/plan";

export type PlanTab = "cost" | "jobs" | "housing";

const SECTION_LINKS = [
  { href: "#overview", label: "Overview" },
  { href: "#checklist", label: "Checklist" },
  { href: "#timeline", label: "Timeline" },
];

const TAB_LINKS: { tab: PlanTab; label: string }[] = [
  { tab: "cost", label: "Cost Estimate" },
  { tab: "jobs", label: "Job Board" },
  { tab: "housing", label: "Housing" },
];

export default function PlanSidebar({
  input,
  onOpenTab,
  showSaveCta,
}: {
  input: PlanInput;
  onOpenTab: (tab: PlanTab) => void;
  showSaveCta: boolean;
}) {
  return (
    <aside className="dashboard-sidebar">
      <div className="planner-card">
        <p className="dashboard-eyebrow">Your plan</p>
        <h1 className="section-title plan-sidebar-title">{input.categoryLabel}</h1>
        <p className="plan-sidebar-route">
          From <strong>{input.homeCountryName}</strong> to{" "}
          <strong>{input.targetCountryName}</strong>
        </p>

        <nav className="dashboard-sidebar-nav">
          {SECTION_LINKS.map(({ href, label }) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
          {TAB_LINKS.map(({ tab, label }) => (
            <button key={tab} type="button" onClick={() => onOpenTab(tab)}>
              {label}
            </button>
          ))}
        </nav>

        {showSaveCta && (
          <Link href="/signup?redirect=/dashboard" className="btn-primary full-width sidebar-cta">
            Save My Plan
          </Link>
        )}
      </div>
    </aside>
  );
}
