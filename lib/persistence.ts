import { createClient } from './supabase/client';
import { savePlan } from './userData';
import type { ChecklistState, PlanInput, StoredPlan } from './types/plan';

const STORAGE_KEYS = {
  plan: 'mcc_plan',
  costViewed: 'mcc_cost_viewed',
  currency: 'mcc_preferred_currency',
} as const;

const CHECKLIST_KEY_PREFIX = 'mcc_checklist_';

// ── Safe localStorage access (private mode / SSR can throw or be absent) ──

function getItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
}

function removeItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* storage unavailable */
  }
}

function readJson<T>(key: string): T | null {
  const raw = getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ── Onboarding context (what the user is planning) ────────────────

export type OnboardingContext = {
  homeCountry: string;
  targetCountry: string;
  category: string;
};

/**
 * The plan inputs saved in mcc_plan. The companion page can store inputs
 * without a generated plan, so this does not require `plan` to exist.
 */
export function readLocalPlanInput(): Partial<PlanInput> | null {
  return readJson<{ input?: Partial<PlanInput> }>(STORAGE_KEYS.plan)?.input ?? null;
}

export function getOnboarding(): OnboardingContext | null {
  const input = readLocalPlanInput();
  if (!input) return null;

  const homeCountry = input.homeCountryName || input.fromCountry;
  const targetCountry = input.targetCountryName || input.toCountry;
  const category = input.categoryLabel || input.category;

  if (!homeCountry || !targetCountry || !category) return null;
  return { homeCountry, targetCountry, category };
}

/** Replace the plan inputs while keeping any generated plan alongside them. */
export function updateLocalPlanInput(input: PlanInput): void {
  const existing = readJson<Record<string, unknown>>(STORAGE_KEYS.plan) ?? {};
  setItem(STORAGE_KEYS.plan, JSON.stringify({ ...existing, input }));
}

export function clearLocalPlan(): void {
  removeItem(STORAGE_KEYS.plan);
}

export function clearLocalData(): void {
  if (typeof window === 'undefined') return;
  clearLocalPlan();
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(CHECKLIST_KEY_PREFIX)) toRemove.push(key);
    }
    toRemove.forEach(removeItem);
  } catch {
    /* storage unavailable */
  }
}

// ── Small per-browser preferences ─────────────────────────────────

export function readPreferredCurrency(): string {
  return getItem(STORAGE_KEYS.currency) ?? 'USD';
}

export function writePreferredCurrency(code: string): void {
  setItem(STORAGE_KEYS.currency, code);
}

export function markCostViewed(): void {
  setItem(STORAGE_KEYS.costViewed, 'true');
}

// ── Local plan helpers ─────────────────────────────────────────────

export function readLocalPlan(): StoredPlan | null {
  const parsed = readJson<StoredPlan>(STORAGE_KEYS.plan);
  return parsed?.plan?.summary ? parsed : null;
}

/**
 * Make a plan the "current" one for pages that read mcc_plan (jobs, housing, companion…).
 * Pass `syncedUserId` when the plan came from Supabase so the merge skips it.
 */
export function writeLocalPlan(stored: StoredPlan, syncedUserId?: string): void {
  setItem(
    STORAGE_KEYS.plan,
    JSON.stringify(syncedUserId ? { ...stored, syncedUserId } : stored)
  );
}

const checklistKey = (planId: string) => `${CHECKLIST_KEY_PREFIX}${planId}`;

export function readLocalChecklist(planId: string): ChecklistState {
  return readJson<ChecklistState>(checklistKey(planId)) ?? {};
}

export function writeLocalChecklist(planId: string, checklist: ChecklistState): void {
  setItem(checklistKey(planId), JSON.stringify(checklist));
}

/**
 * Copy the guest plan in localStorage into Supabase. Safe to call repeatedly:
 * the plan is upserted, and checklist rows already in Supabase are kept
 * (ignoreDuplicates) so stale local state never overwrites synced progress.
 */
export async function mergePlanToSupabase(userId: string): Promise<void> {
  try {
    const stored = readLocalPlan();
    const planId = stored?.plan?.planId;
    if (!stored || !planId || !stored.input) return;
    // Already loaded from this user's account — nothing new to merge.
    if (stored.syncedUserId === userId) return;

    await savePlan(userId, stored);

    const rows = Object.entries(readLocalChecklist(planId)).map(
      ([stepKey, completed]) => ({
        user_id: userId,
        plan_id: planId,
        step_key: stepKey,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
    );
    if (rows.length > 0) {
      const supabase = createClient();
      const { error } = await supabase
        .from('checklist_items')
        .upsert(rows, {
          onConflict: 'user_id,plan_id,step_key',
          ignoreDuplicates: true,
        });
      if (error) throw error;
    }
  } catch (err) {
    console.error('mergePlanToSupabase failed:', err);
  }
}
