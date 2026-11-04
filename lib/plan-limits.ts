/** Distinct plans a guest can generate in one browser before signing up. */
export const GUEST_PLAN_LIMIT = 4

/**
 * Plans a signed-in user can keep saved at once (deleting frees a slot).
 * Enforced by the plans_enforce_limit trigger — keep in sync with
 * supabase/migrations/006_plan_limit.sql.
 */
export const USER_PLAN_LIMIT = 8

/** SQLSTATE raised by the plans_enforce_limit trigger. */
export const PLAN_LIMIT_ERROR_CODE = 'PL001'

/** Identifies a plan by its inputs; regenerating the same route is not a new plan. */
export function planRouteKey(fromCountry: string, toCountry: string, category: string): string {
  return `${fromCountry}|${toCountry}|${category}`
}

/** True when Supabase rejected a save because the user already has the maximum. */
export function isPlanLimitError(err: unknown): boolean {
  return (
    !!err &&
    typeof err === 'object' &&
    'code' in err &&
    err.code === PLAN_LIMIT_ERROR_CODE
  )
}
