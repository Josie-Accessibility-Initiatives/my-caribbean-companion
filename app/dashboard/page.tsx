"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import SavePlanBanner from "@/components/dashboard/SavePlanBanner";
import CostEstimator from "@/components/dashboard/CostEstimator";
import JobCard from "@/components/jobs/JobCard";
import { exportPlanToPDF } from "@/lib/pdfExport";
import { COUNTRY_META } from "@/data/countryMeta";
import type { JobListing } from "@/lib/external/jsearch";
import type { JobLink } from "@/lib/types/jobs";

type JobPreviewResult = {
  country: { code: string; name: string };
  profession: string;
  listings: {
    jobs: JobListing[];
    total: number;
    source: "jsearch" | "cache" | "empty";
  };
  curatedLinks: {
    countryLinks: JobLink[];
    professionLinks: Omit<JobLink, "categories">[];
    caribbeanWideLinks: JobLink[];
  };
};

type ChecklistItem = {
  id: string;
  label: string;
  description: string;
};

type Plan = {
  summary: string;
  notes: string;
  checklist: ChecklistItem[];
  timeline: {
    documents: string;
    skillsCertificate: string;
    verification: string;
  };
  officialLinks: {
    immigration: string | null;
    competentAuthority: string | null;
    forms: string | null;
  };
  planId: string;
};

type StoredPlan = {
  input: {
    fromCountry: string;
    toCountry: string;
    category: string;
    homeCountryName: string;
    targetCountryName: string;
    categoryLabel: string;
  };
  plan: Plan;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [stored, setStored] = useState<StoredPlan | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [jobPreview, setJobPreview] = useState<JobPreviewResult | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("mcc_plan");
    if (!raw) {
      router.replace("/onboarding");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as StoredPlan;
      if (!parsed?.plan?.summary) {
        router.replace("/onboarding");
        return;
      }
      setStored(parsed);
      const stateKey = `mcc_checklist_${parsed.plan.planId}`;
      const checklistRaw = localStorage.getItem(stateKey);
      if (checklistRaw) {
        try {
          setChecked(JSON.parse(checklistRaw));
        } catch {
          /* ignore */
        }
      }
    } catch {
      router.replace("/onboarding");
    }
  }, [router]);

  useEffect(() => {
    if (!stored) return;
    const stateKey = `mcc_checklist_${stored.plan.planId}`;
    localStorage.setItem(stateKey, JSON.stringify(checked));
  }, [checked, stored]);

  useEffect(() => {
    if (!stored) return;
    const { toCountry, categoryLabel } = stored.input;
    if (!toCountry || !categoryLabel) return;
    fetch(
      `/api/jobs?country=${encodeURIComponent(toCountry)}&profession=${encodeURIComponent(categoryLabel)}&page=1`
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data: JobPreviewResult | null) => {
        if (data) setJobPreview(data);
      })
      .catch(() => {
        /* silent — teaser is non-critical */
      });
  }, [stored]);

  if (!stored) {
    return (
      <div className="section">
        <div className="planner-card" style={{ textAlign: "center" }}>
          <p style={{ color: "#6b7280" }}>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const { input, plan } = stored;
  const completedCount = plan.checklist.filter((item) => checked[item.id])
    .length;

  const toggle = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleExportPDF = () => {
    exportPlanToPDF(plan, input, checked, !!user);
  };

  return (
    <div className="page page-dashboard">
      <div className="dashboard-grid">
        <aside className="dashboard-sidebar">
          <div className="planner-card">
            <p className="dashboard-eyebrow">Your plan</p>
            <h1
              className="section-title"
              style={{ marginTop: "0.75rem", marginBottom: "0.75rem" }}
            >
              {input.categoryLabel}
            </h1>
            <p style={{ fontSize: "0.9rem", color: "#4b5563", margin: 0 }}>
              From <strong>{input.homeCountryName}</strong> to{" "}
              <strong>{input.targetCountryName}</strong>
            </p>

            <nav
              className="dashboard-sidebar-nav"
              style={{
                marginTop: "1.5rem",
                paddingTop: "1.25rem",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <a href="#overview">Overview</a>
              <a href="#checklist">Checklist</a>
              <a href="#timeline">Timeline</a>
              <a href="#links">Official Links</a>
              <a href="#cost-estimate">Cost Estimate</a>
              <Link href="/companion">AI Companion</Link>
              <Link href="/jobs">Job Board</Link>
            </nav>

            {!loading && !user && (
              <Link
                href="/signup?redirect=/dashboard"
                className="btn-primary full-width"
                style={{
                  marginTop: "1.5rem",
                  display: "inline-block",
                  textAlign: "center",
                  textDecoration: "none",
                }}
              >
                Save My Plan
              </Link>
            )}
          </div>
        </aside>

        <main>
          <SavePlanBanner />

          <section id="overview" className="dashboard-section">
            <h2 className="section-title">Overview</h2>
            <p style={{ color: "#4b5563", marginTop: "0.5rem" }}>
              {plan.summary}
            </p>
            <p
              style={{
                color: "#6b7280",
                fontSize: "0.85rem",
                marginTop: "1rem",
                marginBottom: 0,
              }}
            >
              {plan.notes}
            </p>
          </section>

          <section id="checklist" className="dashboard-section">
            <h2 className="section-title">Checklist</h2>
            <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
              {completedCount} of {plan.checklist.length} completed
            </p>
            <ul
              className="planner-list"
              style={{ marginTop: "0.75rem", paddingLeft: 0, listStyle: "none" }}
            >
              {plan.checklist.map((item) => (
                <li key={item.id} className="checklist-item">
                  <label
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "flex-start",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!checked[item.id]}
                      onChange={() => toggle(item.id)}
                      style={{ marginTop: "0.25rem" }}
                    />
                    <span>
                      <span className="checklist-label">{item.label}</span>
                      <span
                        className="checklist-description"
                        style={{ marginLeft: 0, display: "block" }}
                      >
                        {item.description}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section id="timeline" className="dashboard-section">
            <h2 className="section-title">Estimated Timeline</h2>
            <ul className="planner-list" style={{ marginTop: "0.5rem" }}>
              <li>
                <strong>Gather documents:</strong> {plan.timeline.documents}
              </li>
              <li>
                <strong>Skills Certificate:</strong>{" "}
                {plan.timeline.skillsCertificate}
              </li>
              <li>
                <strong>Verification:</strong> {plan.timeline.verification}
              </li>
            </ul>
          </section>

          <section id="links" className="dashboard-section">
            <h2 className="section-title">Official Links &amp; Next Steps</h2>
            {plan.officialLinks.immigration ||
            plan.officialLinks.competentAuthority ||
            plan.officialLinks.forms ? (
              <ul className="planner-list" style={{ marginTop: "0.5rem" }}>
                {plan.officialLinks.immigration && (
                  <li>
                    <a
                      href={plan.officialLinks.immigration}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Immigration website (destination country)
                    </a>
                  </li>
                )}
                {plan.officialLinks.competentAuthority && (
                  <li>
                    <a
                      href={plan.officialLinks.competentAuthority}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Competent Authority for Skills Certificates
                    </a>
                  </li>
                )}
                {plan.officialLinks.forms && (
                  <li>
                    <a
                      href={plan.officialLinks.forms}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Forms / Online services
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <p style={{ color: "#6b7280", margin: 0 }}>
                Official links for {input.targetCountryName} aren&apos;t
                available yet.
              </p>
            )}

            <div className="plan-actions">
              <Link href="/onboarding" className="btn-secondary">
                Try Another Country or Category
              </Link>
              <button
                type="button"
                onClick={handleExportPDF}
                className="btn-secondary"
              >
                Export as PDF
              </button>
            </div>
          </section>

          <section id="companion" className="dashboard-section">
            <h2 className="section-title">Ask Your AI Companion</h2>
            <p style={{ color: "#4b5563", margin: "0.5rem 0 1rem" }}>
              Have questions about your move? Your AI companion can answer
              anything about CSME eligibility, documents, and next steps.
            </p>
            <div className="companion-teaser-bubble">
              What documents do I need as a {input.categoryLabel} moving from{" "}
              {input.homeCountryName} to {input.targetCountryName}?
            </div>
            <Link
              href="/companion"
              className="btn-primary"
              style={{
                marginTop: "1.25rem",
                display: "inline-block",
                textDecoration: "none",
              }}
            >
              Chat with Companion
            </Link>
          </section>

          <div id="cost-estimate">
            <CostEstimator
              fromCountry={input.fromCountry}
              toCountry={input.toCountry}
              toCountryName={
                COUNTRY_META[input.toCountry]?.name ?? input.targetCountryName
              }
              category={input.categoryLabel}
              onViewed={() =>
                localStorage.setItem("mcc_cost_viewed", "true")
              }
            />
          </div>

          <section id="jobs" className="dashboard-section">
            <h2 className="section-title">Job Opportunities</h2>
            <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: "0.25rem 0 1rem" }}>
              Jobs for{" "}
              <strong style={{ color: "#111827" }}>{input.categoryLabel}</strong>
              {" "}in{" "}
              <strong style={{ color: "#111827" }}>{input.targetCountryName}</strong>
            </p>

            {jobPreview && jobPreview.listings.jobs.length > 0 ? (
              <>
                <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "0 0 0.75rem" }}>
                  Showing {Math.min(2, jobPreview.listings.total)} of{" "}
                  {jobPreview.listings.total} opportunit{jobPreview.listings.total === 1 ? "y" : "ies"}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {jobPreview.listings.jobs.slice(0, 2).map((job) => (
                    <JobCard
                      key={job.jobId}
                      job={job}
                      userProfession={input.categoryLabel}
                    />
                  ))}
                </div>
                <div className="plan-actions">
                  <Link href="/jobs" className="btn-primary" style={{ textDecoration: "none" }}>
                    View All Jobs →
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p style={{ color: "#4b5563", fontSize: "0.9rem", margin: "0 0 1rem" }}>
                  Browse Caribbean job boards for{" "}
                  <strong>{input.categoryLabel}</strong> opportunities.
                </p>
                <Link href="/jobs" className="btn-secondary" style={{ textDecoration: "none" }}>
                  Browse Job Boards →
                </Link>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
