import type { H3Event } from 'h3'
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '@nusk/shared'

/**
 * Returns a Supabase client scoped to the authenticated user.
 * For session auth, uses the session-scoped client (RLS applies).
 * For PAT auth, uses the service role client (RLS bypassed, user_id must be filtered manually).
 */
export async function getSupabaseClient(event: H3Event) {
  const user = requireUser(event)
  const isPat = user.authMethod === 'pat'

  const client = isPat
    ? serverSupabaseServiceRole<Database>(event)
    : await serverSupabaseClient<Database>(event)

  return { client, userId: user.id, isPat }
}
