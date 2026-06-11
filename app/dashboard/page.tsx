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

// ── Types ──────────────────────────────────────────────────────────

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

type HousingPreview = {
  country: { name: string };
  liveData: {
    averageRentOneBed: { min: number | null; max: number | null } | null;
  };
  staticData: {
    averageRent: {
      oneBed: { min: number; max: number };
      currency: string;
    } | null;
    facebookGroups: { name: string; url: string }[];
    bookingComUrl: string | null;
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

// ── Helpers ────────────────────────────────────────────────────────

function resolveOneBed(
  preview: HousingPreview
): { min: number; max: number } | null {
  const live = preview.liveData.averageRentOneBed;
  if (live?.min != null && live?.max != null) return { min: live.min, max: live.max };
  return preview.staticData.averageRent?.oneBed ?? null;
}

// ── Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [stored, setStored] = useState<StoredPlan | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [jobPreview, setJobPreview] = useState<JobPreviewResult | null>(null);
  const [housingPreview, setHousingPreview] = useState<HousingPreview | null>(null);
  const [activeTab, setActiveTab] = useState<"cost" | "jobs" | "housing">("cost");

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

  // Jobs teaser fetch
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

  // Housing teaser fetch
  useEffect(() => {
    if (!stored) return;
    const { toCountry } = stored.input;
    if (!toCountry) return;
    fetch(`/api/housing?country=${encodeURIComponent(toCountry)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: HousingPreview | null) => {
        if (data) setHousingPreview(data);
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
  const completedCount = plan.checklist.filter((item) => checked[item.id]).length;

  const toggle = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleExportPDF = () => {
    exportPlanToPDF(plan, input, checked, !!user);
  };

  // Resolved housing data for teaser
  const oneBed = housingPreview ? resolveOneBed(housingPreview) : null;
  const bookingUrl = housingPreview?.staticData.bookingComUrl ?? null;
  const firstFbGroup = housingPreview?.staticData.facebookGroups[0] ?? null;
  const housingCountryName =
    housingPreview?.country.name ?? input.targetCountryName;

  const scrollToTabs = () =>
    document.getElementById("tabs")?.scrollIntoView({ behavior: "smooth" });

  const openTab = (tab: "cost" | "jobs" | "housing") => {
    setActiveTab(tab);
    scrollToTabs();
  };

  return (
    <div className="page page-dashboard">
      <div className="dashboard-grid">

        {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
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
              <button
                type="button"
                onClick={() => openTab("cost")}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.5rem",
                  color: "#4b5563",
                  fontSize: "0.9rem",
                  fontFamily: "inherit",
                }}
              >
                Cost Estimate
              </button>
              <button
                type="button"
                onClick={() => openTab("jobs")}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.5rem",
                  color: "#4b5563",
                  fontSize: "0.9rem",
                  fontFamily: "inherit",
                }}
              >
                Job Board
              </button>
              <button
                type="button"
                onClick={() => openTab("housing")}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.5rem",
                  color: "#4b5563",
                  fontSize: "0.9rem",
                  fontFamily: "inherit",
                }}
              >
                Housing
              </button>
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

        {/* ── MAIN CONTENT ─────────────────────────────────────── */}
        <main>
          <SavePlanBanner />

          {/* ── AREA A: Always visible ── */}

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

          {/* ── AREA B: Tabbed section ── */}

          <div id="tabs" className="plan-tabs-container">
            <div className="plan-tabs-bar">
              <button
                type="button"
                className={`plan-tab-btn${activeTab === "cost" ? " active" : ""}`}
                onClick={() => setActiveTab("cost")}
              >
                Cost Estimator
              </button>
              <button
                type="button"
                className={`plan-tab-btn${activeTab === "jobs" ? " active" : ""}`}
                onClick={() => setActiveTab("jobs")}
              >
                Job Opportunities
              </button>
              <button
                type="button"
                className={`plan-tab-btn${activeTab === "housing" ? " active" : ""}`}
                onClick={() => setActiveTab("housing")}
              >
                Housing Discovery
              </button>
            </div>

            <div className="plan-tab-content">

              {/* Tab 1 — Cost Estimator */}
              {activeTab === "cost" && (
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
              )}

              {/* Tab 2 — Job Opportunities */}
              {activeTab === "jobs" && (
                <div>
                  <h2 className="section-title" style={{ marginBottom: "0.25rem" }}>
                    Job Opportunities
                  </h2>
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
                </div>
              )}

              {/* Tab 3 — Housing Discovery */}
              {activeTab === "housing" && (
                <div>
                  <h2 className="section-title" style={{ marginBottom: "0.25rem" }}>
                    Housing Discovery
                  </h2>

                  {oneBed ? (
                    <>
                      <div
                        style={{
                          background: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                          borderRadius: "0.75rem",
                          padding: "1rem 1.25rem",
                          marginBottom: "1rem",
                          marginTop: "0.75rem",
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 0.2rem",
                            fontSize: "1.2rem",
                            fontWeight: 700,
                            color: "var(--color-primary)",
                          }}
                        >
                          ${oneBed.min.toLocaleString()} – ${oneBed.max.toLocaleString()}{" "}
                          <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                            {housingPreview?.staticData.averageRent?.currency ?? "USD"}/month
                          </span>
                        </p>
                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>
                          Estimated 1-bedroom rent in {housingCountryName}
                        </p>
                      </div>

                      {(bookingUrl || firstFbGroup) && (
                        <div
                          style={{
                            display: "flex",
                            gap: "0.6rem",
                            flexWrap: "wrap",
                            marginBottom: "1rem",
                          }}
                        >
                          {bookingUrl && (
                            <a
                              href={bookingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                background: "var(--color-primary-soft)",
                                color: "var(--color-primary)",
                                border: "1px solid var(--color-primary-border)",
                                borderRadius: "999px",
                                padding: "0.35rem 0.85rem",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                textDecoration: "none",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Browse Booking.com →
                            </a>
                          )}
                          {firstFbGroup && (
                            <a
                              href={firstFbGroup.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                background: "rgba(24,119,242,0.08)",
                                color: "#1877f2",
                                border: "1px solid rgba(24,119,242,0.25)",
                                borderRadius: "999px",
                                padding: "0.35rem 0.85rem",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                textDecoration: "none",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Join Housing Groups →
                            </a>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <p style={{ color: "#4b5563", fontSize: "0.9rem", margin: "0.75rem 0 1rem" }}>
                      Find accommodation in{" "}
                      <strong>{housingCountryName}</strong>: temporary stays,
                      long-term rentals, and local housing communities.
                    </p>
                  )}

                  <div className="plan-actions">
                    <Link
                      href="/housing"
                      className="btn-primary"
                      style={{ textDecoration: "none" }}
                    >
                      Explore Housing Options →
                    </Link>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ── AREA C: Always visible ── */}

          <section id="official-links" className="dashboard-section">
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
          </section>

        </main>
      </div>
    </div>
  );
}
