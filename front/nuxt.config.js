export default {
  // 关闭“Are you interested in participation?”
  telemetry: false,
  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: "小紫社区",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" }
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }]
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: ["element-ui/lib/theme-chalk/index.css"],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: ["@/plugins/element-ui", "@/plugins/axios"],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: ["@nuxtjs/axios", "@nuxtjs/proxy"],

  // See https://github.com/nuxt-community/axios-module#options
  axios: {
    proxy: true,
    prefix: "/api/",
    credentials: true
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
    transpile: [/^element-ui/]
  },
  // 跨域代理
  proxy: {
    "/api/": {
      target: "http://localhost:7001",
      secure: false,
      pathRewrite: {
        "^/api": ""
      }
    }
  }
};
