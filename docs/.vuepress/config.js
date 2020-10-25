module.exports = {
  title: 'VueenT',
  description: 'A library which may help to create a scalable Vue.js application',
  base: '/vueent/',
  head: [
    ['link', { rel: 'icon', href: '/img/logo.png' }]
  ],
  themeConfig: {
    logo: '/img/logo.png',
    repo: 'https://github.com/vueent/vueent',
    nav: [
      {
        text: 'Home',
        link: '/'
      },
      {
        text: 'Guide',
        link: '/guide/'
      },
      {
        text: 'Core',
        link: '/core/guide/'
      },
      {
        text: 'Mix Models',
        link: '/mix-models/guide/'
      },
      {
        text: 'Reactive',
        link: '/reactive/guide/'
      }
    ],
    sidebar: 'auto'
  },
  plugins: ['@vuepress/back-to-top']
}
