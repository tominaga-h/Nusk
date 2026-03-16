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
  if (typeof body.category === 'string') updateData.category = body.category
  if (typeof body.color === 'string') updateData.color = body.color
  if (typeof body.sort_order === 'number') updateData.sort_order = body.sort_order
  if (body.list_id !== undefined) updateData.list_id = body.list_id

  let builder = client
    .from('statuses')
    .update(updateData)
    .eq('id', id)

  if (isPat) {
    builder = builder.eq('user_id', userId)
  }

  const { data: status, error } = await builder.select().single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return status
})
