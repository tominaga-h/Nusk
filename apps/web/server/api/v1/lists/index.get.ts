export default defineEventHandler(async (event) => {
  const { client, userId, isPat } = await getSupabaseClient(event)

  let builder = client
    .from('lists')
    .select('*')
    .order('sort_order', { ascending: true })

  if (isPat) {
    builder = builder.eq('user_id', userId)
  }

  const { data: lists, error } = await builder

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return lists
})
