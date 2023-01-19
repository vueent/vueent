const nav = [
  {
    text: 'Home',
    link: '/'
  },
  {
    text: 'Guide',
    link: '/guide/'
  },
  {
    text: 'Reactive',
    link: '/guide/reactive'
  },
  {
    text: 'Core',
    link: '/guide/core'
  },
  {
    text: 'Mix Models',
    link: '/guide/mix-models'
  },
  {
    text: 'Store',
    link: '/guide/store'
  }
];

function getGuideSidebar() {
  return [
    {
      title: 'Guide',
      collapsible: true,
      children: [
        '',
        'reactive',
        'core',
      ]
    },
    {
      title: 'Mix-Models',
      collapsible: true,
      children: [
        'mix-models',
        'base-model',
        'save-mixin',
        'private-and-public-types',
        'rollback-mixin',
        'validate-mixin',
        'models-and-components',
        'mixins-development',
        'tips-and-tricks'
      ]
    },
    {
      title: 'Store',
      collapsible: true,
      children: [
        'store'
      ]
    }
  ];
}

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
    sidebar: 'auto',
    sidebarDepth: 3,
    locales: {
      '/': {
        nav,
        sidebar: {
          '/guide/': getGuideSidebar()
        }
      }
    }
  },
  plugins: ['@vuepress/back-to-top']
};
