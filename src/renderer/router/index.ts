import { McpScreen, ChatScreen, AgentScreen, SettingScreen } from '@/renderer/screens'
import { createRouter, createWebHashHistory } from 'vue-router'
import { DefaultLayout } from '@/renderer/components/layouts'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/commands',
      component: () => import('@/renderer/screens/CommandsScreen.vue')
    },

    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '',
          components: McpScreen,
          meta: {
            titleKey: 'title.main'
          }
        },
        {
          path: 'chat',
          components: ChatScreen,
          meta: {
            titleKey: 'title.chat'
          }
        },
        {
          path: 'agent',
          components: AgentScreen,
          meta: {
            titleKey: 'title.agent'
          }
        },
        {
          path: 'setting',
          components: SettingScreen,
          meta: {
            titleKey: 'title.setting'
          }
        }
      ]
    },
    // {
    //   path: '/',
    //   components: McpScreen,
    //   meta: {
    //     titleKey: 'title.main'
    //   }
    // },
    // {
    //   path: '/chat',
    //   components: ChatScreen,
    //   meta: {
    //     titleKey: 'title.chat'
    //   }
    // },
    // {
    //   path: '/agent',
    //   components: AgentScreen,
    //   meta: {
    //     titleKey: 'title.agent'
    //   }
    // },
    // {
    //   path: '/setting',
    //   components: SettingScreen,
    //   meta: {
    //     titleKey: 'title.setting'
    //   }
    // },
    {
      path: '/error',
      component: () => import('@/renderer/screens/ErrorScreen.vue'),
      meta: {
        titleKey: 'title.error'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})
