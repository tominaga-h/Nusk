export default defineEventHandler(async (event) => {
  const { client, userId, isPat } = await getSupabaseClient(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Task ID is required' })
  }

  const body = await readBody(event)
  if (!body || Object.keys(body).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Request body is required' })
  }

  const allowedFields = [
    'title',
    'status_id',
    'list_id',
    'scheduled_date',
    'reminder_time',
    'recurrence_rule',
    'metadata',
    'sort_order',
    'deleted_at',
  ] as const

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  for (const field of allowedFields) {
    if (field in body) {
      updateData[field] = body[field]
    }
  }

  let builder = client
    .from('tasks')
    .update(updateData)
    .eq('id', id)
    .select()

  if (isPat) {
    builder = builder.eq('user_id', userId)
  }

  const { data: task, error } = await builder.single()

  if (error) {
    throw createError({ statusCode: error.code === 'PGRST116' ? 404 : 500, statusMessage: error.message })
  }

  return task
})
