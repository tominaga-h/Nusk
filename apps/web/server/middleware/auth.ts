import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '@nusk/shared'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/v1/')) return

  try {
    const user = await serverSupabaseUser(event)
    if (user) {
      event.context.user = {
        id: user.sub,
        email: user.email,
        authMethod: 'session',
      }
      return
    }
  } catch {
    // Session auth failed, try PAT
  }

  const authHeader = getRequestHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const rawToken = authHeader.slice(7)
  const tokenHash = await hashToken(rawToken)

  const client = serverSupabaseServiceRole<Database>(event)
  const { data: pat, error } = await client
    .from('personal_access_tokens')
    .select('id, user_id')
    .eq('token_hash', tokenHash)
    .single()

  if (error || !pat) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }

  client
    .from('personal_access_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', pat.id)
    .then()

  event.context.user = {
    id: pat.user_id,
    authMethod: 'pat',
  }
})
