export default defineEventHandler(async (event) => {
  const { client, userId } = await getSupabaseClient(event)
  const body = await readBody(event)

  if (!body?.name || typeof body.name !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'name is required' })
  }

  const { data: status, error } = await client
    .from('statuses')
    .insert({
      user_id: userId,
      name: body.name,
      category: body.category ?? 'TODO',
      color: body.color ?? '#94a3b8',
      list_id: body.list_id ?? null,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  setResponseStatus(event, 201)
  return status
})
