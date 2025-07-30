export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: false },
  modules: ['@nuxt/icon', '@nuxt/image', '@nuxt/ui'],
  app: {
    head: {
      title: 'Kantine',
    }
  },
  css: ['@/assets/css/main.css'],
  ui: {
    theme: {
      colors: ['primary', 'secondary', 'tertiary', 'info', 'success', 'warning', 'error']
    }
  },
  devServer: {
    port: 3000
  }
})