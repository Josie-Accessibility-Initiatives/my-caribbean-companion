"use client";

import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { USER_PLAN_LIMIT } from "@/lib/plan-limits";
import type { SavedPlanSummary } from "@/lib/types/plan";

type MyPlansProps = {
  plans: SavedPlanSummary[];
  activePlanId: string | null;
  onSelect: (planId: string) => void;
  onDelete: (planId: string) => void;
  busyPlanId: string | null;
};

export default function MyPlans({
  plans,
  activePlanId,
  onSelect,
  onDelete,
  busyPlanId,
}: MyPlansProps) {
  const atLimit = plans.length >= USER_PLAN_LIMIT;

  return (
    <section className="my-plans" aria-labelledby="my-plans-title">
      <div className="my-plans-head">
        <div>
          <h2 id="my-plans-title" className="section-title no-margin">
            My plans
          </h2>
          <p className="my-plans-count text-xs text-muted">
            {plans.length} of {USER_PLAN_LIMIT} plans
          </p>
        </div>
        {atLimit ? (
          <p className="my-plans-limit text-xs">Plan limit reached. Delete a plan to create a new one.</p>
        ) : (
          <Link href="/onboarding?new=1" className="btn-primary">
            <Plus size={16} aria-hidden="true" /> New plan
          </Link>
        )}
      </div>

      <div className="my-plans-list">
        {plans.map((saved) => {
          const id = saved.plan.planId;
          const total = saved.plan.checklist.length;
          const pct = total ? Math.round((saved.completedCount / total) * 100) : 0;
          const isActive = id === activePlanId;

          return (
            <div key={id} className={`my-plan-card${isActive ? " active" : ""}`}>
              <button
                type="button"
                className="my-plan-select"
                onClick={() => onSelect(id)}
                aria-pressed={isActive}
                disabled={busyPlanId === id}
              >
                <span className="my-plan-title">{saved.input.categoryLabel}</span>
                <span className="my-plan-route">
                  {saved.input.homeCountryName} → {saved.input.targetCountryName}
                </span>
                <span className="my-plan-progress" aria-hidden="true">
                  <span style={{ width: `${pct}%` }} />
                </span>
                <span className="my-plan-meta">
                  {saved.completedCount}/{total} steps · {pct}%
                  {isActive ? " · Viewing" : ""}
                </span>
              </button>
              <button
                type="button"
                className="my-plan-delete"
                onClick={() => onDelete(id)}
                aria-label={`Delete plan ${saved.input.categoryLabel} to ${saved.input.targetCountryName}`}
                disabled={busyPlanId === id}
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
