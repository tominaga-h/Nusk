export default defineEventHandler(async (event) => {
  const { client, userId } = await getSupabaseClient(event)
  const body = await readBody(event)

  if (!body?.name || typeof body.name !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'name is required' })
  }

  const { data: list, error } = await client
    .from('lists')
    .insert({
      user_id: userId,
      name: body.name,
      is_inbox: body.is_inbox ?? false,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  setResponseStatus(event, 201)
  return list
})
