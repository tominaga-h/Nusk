export default defineEventHandler(async (event) => {
  const { client, userId, isPat } = await getSupabaseClient(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id is required' })
  }

  let builder = client
    .from('statuses')
    .delete()
    .eq('id', id)

  if (isPat) {
    builder = builder.eq('user_id', userId)
  }

  const { error } = await builder

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  setResponseStatus(event, 204)
  return null
})
