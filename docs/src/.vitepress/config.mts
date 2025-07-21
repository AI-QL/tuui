import { withSidebar } from 'vitepress-sidebar'
import pkg from '../../../package.json' with { type: 'json' }
import { defineConfig, UserConfig } from 'vitepress'
import { withI18n } from 'vitepress-i18n'
import type { VitePressSidebarOptions } from 'vitepress-sidebar/types'
import type { VitePressI18nOptions } from 'vitepress-i18n/types'

const { name, repository, homepage } = pkg
const capitalizeFirst = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1)
const supportLocales = ['en', 'zhHans']
const defaultLocale: string = supportLocales[0]

const vitePressI18nConfigs: VitePressI18nOptions = {
  locales: supportLocales,
  rootLocale: defaultLocale,
  searchProvider: 'local',
  description: {
    en: 'A desktop application designed for AI Agentic systems, leveraging the Model Context Protocol.',
    zhHans: '一款为 AI 代理系统设计的工具统一用户界面桌面应用程序，利用模型上下文协议.'
  },
  themeConfig: {
    en: {
      nav: [
        {
          text: 'Getting Started',
          link: '/installation-and-build/getting-started'
        }
      ]
    },
    zhHans: {
      nav: [
        {
          text: '入门',
          link: '/zhHans/installation-and-build/getting-started'
        }
      ]
    }
  }
}

const vitePressSidebarConfigs: VitePressSidebarOptions[] = [
  ...supportLocales.map((lang) => {
    return {
      collapsed: false,
      useTitleFromFileHeading: true,
      useTitleFromFrontmatter: true,
      useFolderTitleFromIndexFile: true,
      sortMenusByFrontmatterOrder: true,
      hyphenToSpace: true,
      capitalizeEachWords: true,
      manualSortFileNameByPriority: [
        'introduction.md',
        'installation-and-build',
        'project-structures',
        'electron-how-to'
      ],
      documentRootPath: `/src/${lang}`,
      resolvePath: defaultLocale === lang ? '/' : `/${lang}/`,
      ...(defaultLocale === lang ? {} : { basePath: `/${lang}/` })
    }
  })
]

const vitePressConfigs: UserConfig = {
  title: capitalizeFirst(name),
  lastUpdated: true,
  outDir: '../dist',
  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
    ['link', { rel: 'shortcut icon', href: '/favicon.ico' }]
  ],
  cleanUrls: true,
  metaChunk: true,
  rewrites: {
    'en/:rest*': ':rest*'
  },
  sitemap: {
    hostname: homepage
  },
  themeConfig: {
    logo: { src: '/icon.png', width: 24, height: 24 },
    editLink: {
      pattern: 'https://github.com/AI-QL/tuui/edit/main/docs/src/:path'
    },
    socialLinks: [{ icon: 'github', link: repository.url.replace('.git', '') }]
  }
}

export default defineConfig(
  withSidebar(withI18n(vitePressConfigs, vitePressI18nConfigs), vitePressSidebarConfigs)
)
