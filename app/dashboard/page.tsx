"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "@/components/auth/AuthProvider";
import PlanWorkspace from "@/components/dashboard/PlanWorkspace";
import ProfileHeader from "@/components/dashboard/ProfileHeader";
import MyPlans from "@/components/dashboard/MyPlans";
import { LoadingCard } from "@/components/ui/LoadingCard";
import {
  mergePlanToSupabase,
  readLocalChecklist,
  clearLocalPlan,
  readLocalPlan,
  writeLocalChecklist,
  writeLocalPlan,
} from "@/lib/persistence";
import {
  deletePlan,
  fetchChecklist,
  fetchPlans,
  fetchProfile,
  saveChecklistItem,
  touchPlan,
} from "@/lib/userData";
import type { ChecklistState, Profile, SavedPlanSummary, StoredPlan } from "@/lib/types/plan";

function DashboardLoading() {
  return <LoadingCard message="Loading your dashboard…" />;
}

// ── Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) return <DashboardLoading />;
  return user ? <UserDashboard user={user} /> : <GuestDashboard />;
}

// ── Guest: single plan from localStorage ───────────────────────────

function GuestDashboard() {
  const router = useRouter();
  const [stored, setStored] = useState<StoredPlan | null>(null);
  const [checked, setChecked] = useState<ChecklistState>({});

  useEffect(() => {
    const local = readLocalPlan();
    if (!local) {
      router.replace("/onboarding");
      return;
    }
    setStored(local);
    setChecked(readLocalChecklist(local.plan.planId));
  }, [router]);

  if (!stored) return <DashboardLoading />;

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      writeLocalChecklist(stored.plan.planId, next);
      return next;
    });

  return (
    <PlanWorkspace
      stored={stored}
      checked={checked}
      onToggle={toggle}
      isSignedIn={false}
      authLoading={false}
    />
  );
}

// ── Signed in: profile + saved plans from Supabase ─────────────────

function UserDashboard({ user }: { user: User }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plans, setPlans] = useState<SavedPlanSummary[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [checked, setChecked] = useState<ChecklistState>({});
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const checkedRef = useRef(checked);
  checkedRef.current = checked;
  const activePlanIdRef = useRef(activePlanId);
  activePlanIdRef.current = activePlanId;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  };

  const activePlan = plans.find((p) => p.plan.planId === activePlanId) ?? null;

  const openPlan = useCallback(
    async (saved: SavedPlanSummary) => {
      const planId = saved.plan.planId;
      setActivePlanId(planId);
      // Keep other pages (jobs, housing, companion) pointed at the open plan.
      writeLocalPlan({ input: saved.input, plan: saved.plan }, user.id);
      const remote = await fetchChecklist(user.id, planId);
      setChecked(remote);
      writeLocalChecklist(planId, remote);
    },
    [user.id]
  );

  // Initial load: merge any guest plan, then read everything from Supabase.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await mergePlanToSupabase(user.id);
        const [profileData, planList] = await Promise.all([
          fetchProfile(user.id),
          fetchPlans(user.id),
        ]);
        if (cancelled) return;
        setProfile(profileData);
        setPlans(planList);
        if (planList[0]) await openPlan(planList[0]);
        if (!cancelled) setStatus("ready");
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user.id, openPlan]);

  const selectPlan = async (planId: string) => {
    if (planId === activePlanId) return;
    const saved = plans.find((p) => p.plan.planId === planId);
    if (!saved) return;
    setBusyPlanId(planId);
    try {
      await openPlan(saved);
      touchPlan(user.id, planId).catch((err) => console.error("touchPlan failed:", err));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      showToast("Couldn't open that plan. Please try again.");
    } finally {
      setBusyPlanId(null);
    }
  };

  const removePlan = async (planId: string) => {
    const saved = plans.find((p) => p.plan.planId === planId);
    if (!saved) return;
    const label = `${saved.input.categoryLabel} → ${saved.input.targetCountryName}`;
    if (!window.confirm(`Delete the plan "${label}"? This removes its checklist progress too.`)) {
      return;
    }
    setBusyPlanId(planId);
    try {
      await deletePlan(user.id, planId);
      const remaining = plans.filter((p) => p.plan.planId !== planId);
      setPlans(remaining);
      if (planId === activePlanId) {
        if (remaining[0]) {
          await openPlan(remaining[0]);
        } else {
          setActivePlanId(null);
          setChecked({});
          clearLocalPlan();
        }
      }
      showToast("Plan deleted");
    } catch (err) {
      console.error(err);
      showToast("Couldn't delete that plan. Please try again.");
    } finally {
      setBusyPlanId(null);
    }
  };

  const toggle = (id: string) => {
    if (!activePlanId) return;
    const planId = activePlanId;
    const completed = !checkedRef.current[id];
    const next = { ...checkedRef.current, [id]: completed };

    setChecked(next);
    writeLocalChecklist(planId, next);
    setPlans((prev) =>
      prev.map((p) =>
        p.plan.planId === planId
          ? { ...p, completedCount: p.plan.checklist.filter((item) => next[item.id]).length }
          : p
      )
    );

    saveChecklistItem(user.id, planId, id, completed).catch((err) => {
      console.error("saveChecklistItem failed:", err);
      showToast("Couldn't save that change. Check your connection.");
      if (activePlanIdRef.current === planId) {
        setChecked((prev) => {
          const reverted = { ...prev, [id]: !completed };
          writeLocalChecklist(planId, reverted);
          return reverted;
        });
      }
      setPlans((prev) =>
        prev.map((p) =>
          p.plan.planId === planId
            ? { ...p, completedCount: p.completedCount + (completed ? -1 : 1) }
            : p
        )
      );
    });
  };

  if (status === "loading") return <DashboardLoading />;

  if (status === "error") {
    return (
      <div className="section">
        <div className="planner-card loading-card">
          <p className="form-error">We couldn&apos;t load your dashboard.</p>
          <button type="button" className="btn-secondary" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  const header = (
    <div className="dashboard-top">
      <ProfileHeader profile={profile} email={user.email ?? null} planCount={plans.length} />
      {plans.length > 0 && (
        <MyPlans
          plans={plans}
          activePlanId={activePlanId}
          onSelect={selectPlan}
          onDelete={removePlan}
          busyPlanId={busyPlanId}
        />
      )}
    </div>
  );

  return (
    <>
      {activePlan ? (
        <PlanWorkspace
          key={activePlan.plan.planId}
          stored={activePlan}
          checked={checked}
          onToggle={toggle}
          isSignedIn
          authLoading={false}
          header={header}
        />
      ) : (
        <div className="page page-dashboard">
          {header}
          <div className="dashboard-top">
            <section className="planner-card text-center">
              <h2 className="section-title">You don&apos;t have a plan yet</h2>
              <p className="text-body">
                Answer three quick questions and we&apos;ll build your CSME relocation checklist.
              </p>
              <Link href="/onboarding?new=1" className="btn-primary mt-1">
                Plan my move
              </Link>
            </section>
          </div>
        </div>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
