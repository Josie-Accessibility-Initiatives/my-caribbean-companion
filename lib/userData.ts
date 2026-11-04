// Supabase data layer for signed-in users: profile, saved plans, checklist.
// All calls run in the browser and rely on RLS to scope rows to the user.
import { createClient } from './supabase/client';
import { categoryLabel, countryName } from './constants';
import type {
  ChecklistState,
  Plan,
  PlanInput,
  Profile,
  SavedPlanSummary,
  StoredPlan,
} from './types/plan';

type PlanRow = {
  plan_id: string;
  from_country: string;
  to_country: string;
  category: string;
  plan_data: Plan;
  input: PlanInput | null;
  created_at: string | null;
  last_opened_at: string | null;
};

type ChecklistRow = {
  plan_id: string;
  step_key: string;
  completed: boolean;
};

const PROFILE_COLUMNS =
  'id, full_name, home_country, current_country, profession, date_of_birth, created_at';

// Rows merged before migration 003 have no `input`, so derive labels from codes.
function rowToStoredPlan(row: PlanRow): StoredPlan {
  const input: PlanInput = row.input ?? {
    fromCountry: row.from_country,
    toCountry: row.to_country,
    category: row.category,
    homeCountryName: countryName(row.from_country),
    targetCountryName: countryName(row.to_country),
    categoryLabel: categoryLabel(row.category),
  };
  return { input, plan: row.plan_data };
}

// ── Profile ────────────────────────────────────────────────────────

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export type ProfileUpdate = Partial<
  Pick<Profile, 'full_name' | 'home_country' | 'current_country' | 'profession' | 'date_of_birth'>
>;

export async function updateProfile(userId: string, patch: ProfileUpdate): Promise<Profile> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...patch })
    .select(PROFILE_COLUMNS)
    .single();
  if (error) throw error;
  return data as Profile;
}

// ── Plans ──────────────────────────────────────────────────────────

/** All saved plans with checklist progress, most recently opened first. */
export async function fetchPlans(userId: string): Promise<SavedPlanSummary[]> {
  const supabase = createClient();
  const [plansRes, checklistRes] = await Promise.all([
    supabase
      .from('plans')
      .select('plan_id, from_country, to_country, category, plan_data, input, created_at, last_opened_at')
      .eq('user_id', userId)
      .order('last_opened_at', { ascending: false, nullsFirst: false }),
    supabase
      .from('checklist_items')
      .select('plan_id, step_key, completed')
      .eq('user_id', userId)
      .eq('completed', true),
  ]);
  if (plansRes.error) throw plansRes.error;
  if (checklistRes.error) throw checklistRes.error;

  const completedByPlan = new Map<string, Set<string>>();
  for (const row of (checklistRes.data ?? []) as ChecklistRow[]) {
    const set = completedByPlan.get(row.plan_id) ?? new Set<string>();
    set.add(row.step_key);
    completedByPlan.set(row.plan_id, set);
  }

  return ((plansRes.data ?? []) as PlanRow[]).map((row) => {
    const stored = rowToStoredPlan(row);
    const done = completedByPlan.get(row.plan_id);
    const completedCount = stored.plan.checklist.filter((item) => done?.has(item.id)).length;
    return {
      ...stored,
      createdAt: row.created_at,
      lastOpenedAt: row.last_opened_at,
      completedCount,
    };
  });
}

/** Insert or refresh a plan and mark it as the most recently opened. */
export async function savePlan(userId: string, stored: StoredPlan): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('plans').upsert(
    {
      user_id: userId,
      plan_id: stored.plan.planId,
      from_country: stored.input.fromCountry,
      to_country: stored.input.toCountry,
      category: stored.input.category,
      plan_data: stored.plan,
      input: stored.input,
      last_opened_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,plan_id' }
  );
  if (error) throw error;
}

export async function touchPlan(userId: string, planId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('plans')
    .update({ last_opened_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('plan_id', planId);
  if (error) throw error;
}

export async function deletePlan(userId: string, planId: string): Promise<void> {
  const supabase = createClient();
  const checklistRes = await supabase
    .from('checklist_items')
    .delete()
    .eq('user_id', userId)
    .eq('plan_id', planId);
  if (checklistRes.error) throw checklistRes.error;
  const planRes = await supabase
    .from('plans')
    .delete()
    .eq('user_id', userId)
    .eq('plan_id', planId);
  if (planRes.error) throw planRes.error;
}

// ── Checklist ──────────────────────────────────────────────────────

export async function fetchChecklist(userId: string, planId: string): Promise<ChecklistState> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('checklist_items')
    .select('plan_id, step_key, completed')
    .eq('user_id', userId)
    .eq('plan_id', planId);
  if (error) throw error;
  const state: ChecklistState = {};
  for (const row of (data ?? []) as ChecklistRow[]) state[row.step_key] = row.completed;
  return state;
}

export async function saveChecklistItem(
  userId: string,
  planId: string,
  stepKey: string,
  completed: boolean
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('checklist_items').upsert(
    {
      user_id: userId,
      plan_id: planId,
      step_key: stepKey,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    },
    { onConflict: 'user_id,plan_id,step_key' }
  );
  if (error) throw error;
}
