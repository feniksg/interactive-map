export default defineNuxtConfig({
  ssr: false, // ❗ WebGL = только SPA
  devtools: { enabled: true },

  app: {
    head: {
      title: '3D Карта университета',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, user-scalable=no' }
      ]
    }
  }
})
