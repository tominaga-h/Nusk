// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // devサーバーのポート設定
  devServer: {
    port: 3003,
  },

  modules: ['@nuxtjs/supabase'],

  css: [
    '~/assets/scss/_global.scss',
    '~/assets/scss/_fonts.scss',
    '~/assets/scss/_utilities.scss',
  ],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss" as *;',
        },
      },
    },
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    serviceKey: process.env.SUPABASE_SECRET_KEY,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/config'],
    },
    types: '~/types/database.types.ts',
  },
})
