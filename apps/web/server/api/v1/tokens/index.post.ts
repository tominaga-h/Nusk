import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '@nusk/shared'

export default defineEventHandler(async (event) => {
  const user = requireSessionUser(event)
  const body = await readBody(event)

  if (!body?.name || typeof body.name !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'name is required' })
  }

  const rawToken = generateToken()
  const tokenHash = await hashToken(rawToken)

  const client = serverSupabaseServiceRole<Database>(event)
  const { data: pat, error } = await client
    .from('personal_access_tokens')
    .insert({
      user_id: user.id,
      token_hash: tokenHash,
      name: body.name,
    })
    .select('id, name, created_at')
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  setResponseStatus(event, 201)
  return {
    ...pat,
    token: rawToken,
  }
})
