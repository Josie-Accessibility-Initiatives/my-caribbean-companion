/** AI Companion messages each signed-in user can send per day (UTC). */
export const CHAT_DAILY_LIMIT = 5

/** Longest new question a user can send (server check + textarea maxLength). */
export const MAX_MESSAGE_LENGTH = 2000

/** Response header carrying how many messages the user has left today. */
export const CHAT_REMAINING_HEADER = 'X-Chat-Remaining'

/** Body of GET /api/chat — messages the signed-in user has left today. */
export type ChatUsage = { remaining: number }

/** Messages left today after `used` have been sent. */
export function remainingToday(used: number): number {
  return Math.max(CHAT_DAILY_LIMIT - used, 0)
}
