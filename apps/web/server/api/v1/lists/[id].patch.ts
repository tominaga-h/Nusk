export default defineEventHandler(async (event) => {
  const { client, userId, isPat } = await getSupabaseClient(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id is required' })
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (typeof body.name === 'string') updateData.name = body.name
  if (typeof body.sort_order === 'number') updateData.sort_order = body.sort_order
  if (typeof body.is_inbox === 'boolean') updateData.is_inbox = body.is_inbox

  let builder = client
    .from('lists')
    .update(updateData)
    .eq('id', id)

  if (isPat) {
    builder = builder.eq('user_id', userId)
  }

  const { data: list, error } = await builder.select().single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return list
})
