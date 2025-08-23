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
    en: 'TUUI is a free and open-source desktop application designed for AI agentic systems, leveraging the Model Context Protocol.',
    zhHans:
      'TUUI 是一款基于模型上下文协议（Model Context Protocol）、专为AI智能体系统设计的免费开源桌面应用程序。'
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
    ['link', { rel: 'shortcut icon', href: '/favicon.ico' }],
    [
      'meta',
      {
        name: 'keywords',
        content:
          'MCP, Model Context Protocol, Client, TUUI, AI, agent, LLM, 模型上下文协议, 桌面应用, 开源工具, AI代理, 开发者工具, AI开发, 工具调用'
      }
    ]
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
