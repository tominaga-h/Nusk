import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '@nusk/shared'

export default defineEventHandler(async (event) => {
  const user = requireSessionUser(event)

  const client = serverSupabaseServiceRole<Database>(event)
  const { data: tokens, error } = await client
    .from('personal_access_tokens')
    .select('id, name, created_at, last_used_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return tokens
})
