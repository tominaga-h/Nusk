export default defineEventHandler(async (event) => {
  const { client, userId, isPat } = await getSupabaseClient(event)
  const query = getQuery(event)

  let builder = client
    .from('statuses')
    .select('*')
    .order('sort_order', { ascending: true })

  if (isPat) {
    builder = builder.eq('user_id', userId)
  }

  if (query.list_id && typeof query.list_id === 'string') {
    builder = builder.eq('list_id', query.list_id)
  }

  const { data: statuses, error } = await builder

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return statuses
})
