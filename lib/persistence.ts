import { createClient } from './supabase/client';

const STORAGE_KEYS = {
  plan: 'mcc_plan',
} as const;

const CHECKLIST_KEY_PREFIX = 'mcc_checklist_';

type StoredPlan = {
  input: {
    fromCountry: string;
    toCountry: string;
    category: string;
    homeCountryName?: string;
    targetCountryName?: string;
    categoryLabel?: string;
  };
  plan: {
    planId: string;
    [key: string]: unknown;
  };
};

type StoredChecklist = Record<string, boolean>;

export function clearLocalData(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEYS.plan);
  const toRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith(CHECKLIST_KEY_PREFIX)) {
      toRemove.push(key);
    }
  }
  toRemove.forEach((k) => window.localStorage.removeItem(k));
}

export async function mergePlanToSupabase(userId: string): Promise<void> {
  try {
    if (typeof window === 'undefined') return;

    const planRaw = window.localStorage.getItem(STORAGE_KEYS.plan);
    if (!planRaw) return;

    const stored = JSON.parse(planRaw) as StoredPlan;
    const planId = stored?.plan?.planId;
    if (!planId || !stored.input) return;

    const supabase = createClient();

    const { data: existing } = await supabase
      .from('plans')
      .select('id')
      .eq('user_id', userId)
      .eq('plan_id', planId)
      .maybeSingle();

    if (!existing) {
      await supabase.from('plans').insert({
        user_id: userId,
        plan_id: planId,
        from_country: stored.input.fromCountry,
        to_country: stored.input.toCountry,
        category: stored.input.category,
        plan_data: stored.plan,
      });
    }

    const checklistRaw = window.localStorage.getItem(
      `${CHECKLIST_KEY_PREFIX}${planId}`
    );
    if (checklistRaw) {
      const checklist = JSON.parse(checklistRaw) as StoredChecklist;
      for (const [stepKey, completed] of Object.entries(checklist)) {
        await supabase.from('checklist_items').upsert(
          {
            user_id: userId,
            plan_id: planId,
            step_key: stepKey,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
          },
          { onConflict: 'user_id,plan_id,step_key' }
        );
      }
    }

    console.log('Plan merged to Supabase for user: ' + userId);
  } catch (err) {
    console.error('mergePlanToSupabase failed:', err);
  }
}
