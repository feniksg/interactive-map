
const domain = "https://map.bfu-id.ru/"
const shortdomain = new URL(domain).host

export default defineNuxtConfig({
    ssr: false, // ❗ WebGL = только SPA
    devtools: { enabled: false },

    app: {
        head: {
            title: '3D Карта университета',
            meta: [
                { name: 'viewport', content: 'width=device-width, initial-scale=1, user-scalable=no' }
            ]
        }
    },
    vite: {
        server: {
            allowedHosts: [shortdomain, 'www.'+shortdomain, 'sso.'+shortdomain,],
            hmr: { protocol: 'wss', host: shortdomain, port: 443 },
        },
        preview: {
            allowedHosts: [shortdomain],
        },
    },
    runtimeConfig: {
        public: {
            nuxt4Url: domain,
        }
    },
})
