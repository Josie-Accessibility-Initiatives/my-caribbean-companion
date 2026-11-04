import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { apiError } from '@/lib/api'

/**
 * DELETE /api/account — permanently delete the signed-in user.
 * The user is taken from the session cookie (never from the request body),
 * so a user can only delete themselves. Their profile, plans and checklist
 * rows are removed by ON DELETE CASCADE on auth.users.
 */
export async function DELETE() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return apiError('You need to be signed in to delete your account.', 401)
  }

  // Deleting an auth user needs the service role key, so it happens server-side.
  const { error } = await adminClient.auth.admin.deleteUser(user.id)
  if (error) {
    console.error('DELETE /api/account:', error)
    return apiError('Could not delete your account. Please try again.', 500)
  }

  return NextResponse.json({ deleted: true })
}
