export default defineEventHandler(async (event) => {
  const { client, userId, isPat } = await getSupabaseClient(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id is required' })
  }

  let checkBuilder = client
    .from('lists')
    .select('id, is_inbox')
    .eq('id', id)

  if (isPat) {
    checkBuilder = checkBuilder.eq('user_id', userId)
  }

  const { data: existing, error: checkError } = await checkBuilder.single()

  if (checkError || !existing) {
    throw createError({ statusCode: 404, statusMessage: 'List not found' })
  }

  if (existing.is_inbox) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot delete Inbox list' })
  }

  let builder = client
    .from('lists')
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
