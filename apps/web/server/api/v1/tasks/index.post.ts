export default defineEventHandler(async (event) => {
  const { client, userId, isPat } = await getSupabaseClient(event)
  const body = await readBody(event)

  if (!body?.title || typeof body.title !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'title is required' })
  }

  let listId: string = body.list_id
  if (!listId) {
    let inboxQuery = client
      .from('lists')
      .select('id')
      .eq('is_inbox', true)

    if (isPat) inboxQuery = inboxQuery.eq('user_id', userId)

    const { data: inbox, error: inboxError } = await inboxQuery.single()

    if (inboxError || !inbox) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Inbox list not found. Please create one first.',
      })
    }
    listId = inbox.id
  }

  let statusId: string = body.status_id
  if (!statusId) {
    const { data: listStatus } = await client
      .from('statuses')
      .select('id')
      .eq('list_id', listId)
      .eq('category', 'TODO')
      .order('sort_order', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (listStatus) {
      statusId = listStatus.id
    } else {
      const { data: globalStatus, error: statusError } = await client
        .from('statuses')
        .select('id')
        .is('list_id', null)
        .eq('category', 'TODO')
        .order('sort_order', { ascending: true })
        .limit(1)
        .single()

      if (statusError || !globalStatus) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Default status not found. Please create a TODO status first.',
        })
      }
      statusId = globalStatus.id
    }
  }

  const insertData = {
    user_id: userId,
    list_id: listId,
    status_id: statusId,
    title: body.title,
    scheduled_date: body.scheduled_date ?? null,
    reminder_time: body.reminder_time ?? null,
    recurrence_rule: body.recurrence_rule ?? null,
    metadata: body.metadata ?? {},
    sort_order: body.sort_order ?? 0,
  }

  const { data: task, error } = await client
    .from('tasks')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  setResponseStatus(event, 201)
  return task
})
