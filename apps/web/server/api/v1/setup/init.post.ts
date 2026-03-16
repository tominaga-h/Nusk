import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '@nusk/shared'

export default defineEventHandler(async (event) => {
  const { client, userId } = await getSupabaseClient(event)
  const admin = serverSupabaseServiceRole<Database>(event)
  const body = await readBody(event)

  const { data: existingLists } = await client
    .from('lists')
    .select('id')
    .limit(1)

  if (existingLists && existingLists.length > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Setup already completed',
    })
  }

  const listsInput: Array<{ name: string; is_inbox?: boolean }> = body?.lists?.length
    ? body.lists
    : [{ name: 'Inbox', is_inbox: true }]

  const statusesInput: Array<{ name: string; category?: string; color?: string }> = body?.statuses?.length
    ? body.statuses
    : [
        { name: '未対応', category: 'TODO', color: '#94a3b8' },
        { name: '対応中', category: 'IN_PROGRESS', color: '#0ea5e9' },
        { name: '完了', category: 'DONE', color: '#10b981' },
      ]

  const { data: lists, error: listError } = await client
    .from('lists')
    .insert(
      listsInput.map((l, i) => ({
        user_id: userId,
        name: l.name,
        is_inbox: l.is_inbox ?? (i === 0),
        sort_order: i,
      })),
    )
    .select()

  if (listError || !lists) {
    throw createError({ statusCode: 500, statusMessage: listError?.message ?? 'Failed to create lists' })
  }

  const { data: statuses, error: statusError } = await client
    .from('statuses')
    .insert(
      statusesInput.map((s, i) => ({
        user_id: userId,
        list_id: null,
        name: s.name,
        category: (s.category ?? 'TODO') as 'TODO' | 'IN_PROGRESS' | 'DONE',
        color: s.color ?? '#94a3b8',
        sort_order: i,
      })),
    )
    .select()

  if (statusError) {
    throw createError({ statusCode: 500, statusMessage: statusError.message })
  }

  const { error: metaError } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: { is_setup_complete: true },
  })

  if (metaError) {
    throw createError({ statusCode: 500, statusMessage: metaError.message })
  }

  return { lists, statuses }
})
