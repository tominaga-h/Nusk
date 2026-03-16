export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  const excludedPaths = ['/login', '/confirm', '/config', '/']

  if (excludedPaths.includes(to.path)) return

  if (!user.value) return

  const isSetupComplete = user.value.user_metadata?.is_setup_complete

  if (!isSetupComplete) {
    return navigateTo('/config')
  }
})
