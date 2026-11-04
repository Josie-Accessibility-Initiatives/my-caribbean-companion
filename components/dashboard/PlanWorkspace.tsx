"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import SavePlanBanner from "@/components/dashboard/SavePlanBanner";
import CostEstimator from "@/components/cost/CostEstimator";
import PlanSidebar, { type PlanTab } from "@/components/dashboard/PlanSidebar";
import JobsTeaser from "@/components/dashboard/JobsTeaser";
import HousingTeaser from "@/components/dashboard/HousingTeaser";
import { exportPlanToPDF } from "@/lib/pdfExport";
import { fetchJson } from "@/lib/fetch-json";
import { markCostViewed } from "@/lib/persistence";
import { COUNTRY_META } from "@/data/countryMeta";
import type { HousingApiResponse } from "@/lib/types/housing";
import type { JobsApiResponse } from "@/lib/types/jobs";
import type { ChecklistState, StoredPlan } from "@/lib/types/plan";

const TABS: { id: PlanTab; label: string }[] = [
  { id: "cost", label: "Cost Estimator" },
  { id: "jobs", label: "Job Opportunities" },
  { id: "housing", label: "Housing Discovery" },
];

type PlanWorkspaceProps = {
  stored: StoredPlan;
  checked: ChecklistState;
  onToggle: (id: string) => void;
  isSignedIn: boolean;
  authLoading: boolean;
  /** Rendered above the sidebar/content grid (e.g. profile header, plan switcher). */
  header?: ReactNode;
};

/** Load the job and housing teasers for the plan's destination (non-critical). */
function usePlanPreviews({ toCountry, categoryLabel }: StoredPlan["input"]) {
  const [jobs, setJobs] = useState<JobsApiResponse | null>(null);
  const [housing, setHousing] = useState<HousingApiResponse | null>(null);

  useEffect(() => {
    if (!toCountry) return;
    const country = encodeURIComponent(toCountry);
    if (categoryLabel) {
      fetchJson<JobsApiResponse>(
        `/api/jobs?country=${country}&profession=${encodeURIComponent(categoryLabel)}&page=1`
      )
        .then(setJobs)
        .catch(() => {});
    }
    fetchJson<HousingApiResponse>(`/api/housing?country=${country}`)
      .then(setHousing)
      .catch(() => {});
  }, [toCountry, categoryLabel]);

  return { jobs, housing };
}

export default function PlanWorkspace({
  stored,
  checked,
  onToggle,
  isSignedIn,
  authLoading,
  header,
}: PlanWorkspaceProps) {
  const { input, plan } = stored;
  const [activeTab, setActiveTab] = useState<PlanTab>("cost");
  const previews = usePlanPreviews(input);
  const completedCount = plan.checklist.filter((item) => checked[item.id]).length;

  const openTab = (tab: PlanTab) => {
    setActiveTab(tab);
    document.getElementById("tabs")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="page page-dashboard">
      {header}
      <div className="dashboard-grid">
        <PlanSidebar
          input={input}
          onOpenTab={openTab}
          showSaveCta={!authLoading && !isSignedIn}
        />

        <main>
          <SavePlanBanner />

          {/* ── Always visible ── */}
          <section id="overview" className="dashboard-section">
            <h2 className="section-title">Overview</h2>
            <p className="section-body">{plan.summary}</p>
            <p className="section-notes">{plan.notes}</p>
            <div className="row mt-1">
              <Link href={`/resources/${input.toCountry}`} className="btn-primary">
                Explore {input.targetCountryName}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/resources" className="btn-secondary">
                <FileText size={15} aria-hidden="true" />
                Document Hub
              </Link>
            </div>
          </section>

          <section id="checklist" className="dashboard-section">
            <h2 className="section-title">Checklist</h2>
            <p className="text-muted text-xs">
              {completedCount} of {plan.checklist.length} completed
            </p>
            <ul className="checklist">
              {plan.checklist.map((item) => (
                <li key={item.id} className="checklist-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={!!checked[item.id]}
                      onChange={() => onToggle(item.id)}
                    />
                    <span>
                      <span className="checklist-label">{item.label}</span>
                      <span className="checklist-description">{item.description}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section id="timeline" className="dashboard-section">
            <h2 className="section-title">Estimated Timeline</h2>
            <ul className="planner-list">
              <li>
                <strong>Gather documents:</strong> {plan.timeline.documents}
              </li>
              <li>
                <strong>Skills Certificate:</strong> {plan.timeline.skillsCertificate}
              </li>
              <li>
                <strong>Verification:</strong> {plan.timeline.verification}
              </li>
            </ul>
          </section>

          {/* ── Tabbed tools ── */}
          <div id="tabs" className="plan-tabs-container">
            <div className="plan-tabs-bar">
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  className={`plan-tab-btn${activeTab === id ? " active" : ""}`}
                  onClick={() => setActiveTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="plan-tab-content">
              {activeTab === "cost" && (
                <CostEstimator
                  fromCountry={input.fromCountry}
                  toCountry={input.toCountry}
                  toCountryName={COUNTRY_META[input.toCountry]?.name ?? input.targetCountryName}
                  category={input.categoryLabel}
                  onViewed={markCostViewed}
                />
              )}
              {activeTab === "jobs" && <JobsTeaser input={input} preview={previews.jobs} />}
              {activeTab === "housing" && (
                <HousingTeaser input={input} preview={previews.housing} />
              )}
            </div>
          </div>

          {/* ── Actions ── */}
          <section id="official-links" className="dashboard-section">
            <div className="row">
              <Link href="/onboarding" className="btn-secondary">
                Try Another Country or Category
              </Link>
              <button
                type="button"
                onClick={() => exportPlanToPDF(plan, input, checked, isSignedIn)}
                className="btn-secondary"
              >
                Export as PDF
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
