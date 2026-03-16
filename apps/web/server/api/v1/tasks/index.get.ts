export default defineEventHandler(async (event) => {
  const { client, userId, isPat } = await getSupabaseClient(event)
  const query = getQuery(event)

  let builder = client
    .from('tasks')
    .select('*')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (isPat) {
    builder = builder.eq('user_id', userId)
  }

  if (query.list_id && typeof query.list_id === 'string') {
    builder = builder.eq('list_id', query.list_id)
  }

  if (query.scheduled_date && typeof query.scheduled_date === 'string') {
    builder = builder.eq('scheduled_date', query.scheduled_date)
  }

  if (query.status_id && typeof query.status_id === 'string') {
    builder = builder.eq('status_id', query.status_id)
  }

  const { data: tasks, error } = await builder

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return tasks
})
