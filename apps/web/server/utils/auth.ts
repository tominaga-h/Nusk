import type { H3Event } from 'h3'

interface AuthUser {
  id: string
  email?: string
  authMethod: 'session' | 'pat'
}

declare module 'h3' {
  interface H3EventContext {
    user?: AuthUser
  }
}

export type { AuthUser }

export function requireUser(event: H3Event): AuthUser {
  const user = event.context.user
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return user
}

export function requireSessionUser(event: H3Event): AuthUser {
  const user = requireUser(event)
  if (user.authMethod !== 'session') {
    throw createError({
      statusCode: 403,
      statusMessage: 'This endpoint requires session authentication',
    })
  }
  return user
}

export async function hashToken(rawToken: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(rawToken)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `nusk_${hex}`
}
