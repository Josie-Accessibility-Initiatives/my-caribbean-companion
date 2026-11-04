export type ChecklistItem = {
  id: string;
  label: string;
  description: string;
};

export type Plan = {
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

export type PlanInput = {
  fromCountry: string;
  toCountry: string;
  category: string;
  homeCountryName: string;
  targetCountryName: string;
  categoryLabel: string;
};

// Shape stored in localStorage under "mcc_plan"
export type StoredPlan = {
  input: PlanInput;
  plan: Plan;
  /** Set when the plan was loaded from this user's Supabase account. */
  syncedUserId?: string;
};

export type ChecklistState = Record<string, boolean>;

export type Profile = {
  id: string;
  full_name: string | null;
  home_country: string | null;
  current_country: string | null;
  profession: string | null;
  date_of_birth: string | null;
  created_at: string | null;
};

export type SavedPlanSummary = StoredPlan & {
  lastOpenedAt: string | null;
  createdAt: string | null;
  completedCount: number;
};
