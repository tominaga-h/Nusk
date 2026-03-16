export default defineEventHandler(async (event) => {
  const { client, userId, isPat } = await getSupabaseClient(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Task ID is required' })
  }

  let builder = client
    .from('tasks')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)

  if (isPat) {
    builder = builder.eq('user_id', userId)
  }

  const { data: task, error } = await builder.single()

  if (error || !task) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  return task
})
