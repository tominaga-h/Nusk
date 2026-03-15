// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/supabase'],

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    secretKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: [],
    },
    types: '~/types/database.types.ts',
  },
})
