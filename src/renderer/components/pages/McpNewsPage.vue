<script setup lang="ts">
import { computed } from 'vue'

const mcpNews = [
  {
    img: 'https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2F3aabd8804251c0364cbde9d2e4be6dc8e8c2faec-2880x1620.png&w=3840&q=75',
    title: 'Introducing the MCP',
    subtitle:
      'A new standard for connecting AI assistants to the systems where data lives, including content repositories, business tools, and development environments.',
    duration: '3',
    link: 'https://www.anthropic.com/news/model-context-protocol'
  },
  {
    img: 'https://substackcdn.com/image/fetch/$s_!eia6!,w_1200,h_600,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fefdde8bc-e290-44aa-ab4c-b3ac86c1a70a_1512x982.png',
    title: 'MCP Specification',
    subtitle:
      'The Model Context Protocol (MCP) follows a client-host-server architecture where each host can run multiple client instances.',
    duration: '120',
    link: 'https://modelcontextprotocol.io'
  },
  {
    img: 'https://cf-assets.www.cloudflare.com/zkvhlag99gkb/6ifiJyB00Saj3K0TtU5QWn/7c552a4795603414457c7c33c4f432a2/image2.png',
    title: 'Remote MCP Servers',
    subtitle:
      'Build and deploy Remote Model Context Protocol (MCP) servers to Cloudflare. It creates the opportunity to reach a wider audience of Internet users who are not going to install and run MCP servers locally for use with desktop apps.',
    duration: '9',
    link: 'https://blog.cloudflare.com/remote-model-context-protocol-servers-mcp/'
  },
  {
    img: 'https://github.blog/wp-content/uploads/2025/04/430176017-a2926942-1c3d-4f95-bb73-861d8003aecb.png?w=1600',
    title: 'MCP Servers',
    subtitle:
      'A collection of reference implementations for the Model Context Protocol (MCP), as well as references to community built servers and additional resources.',
    duration: '30',
    link: 'https://github.com/modelcontextprotocol/servers'
  },
  {
    img: 'https://cdn.jsdelivr.net/gh/astral-sh/uv@main/assets/svg/Astral.svg',
    title: 'UV',
    subtitle:
      'An extremely fast Python package and project manager, written in Rust. A single tool to replace pip, pip-tools, pipx, poetry, pyenv, twine, virtualenv, and more.',
    duration: '5',
    link: 'https://docs.astral.sh/uv/getting-started/installation/'
  },
  {
    img: 'https://nodejs.org/static/logos/nodejsDark.svg',
    title: 'Node.js',
    subtitle:
      'Node.js® is a free, open-source, cross-platform JavaScript runtime environment that lets developers create servers, web apps, command line tools and scripts.',
    duration: '5',
    link: 'https://nodejs.org/'
  },
  {
    img: 'https://www.anthropic.com/_next/image?url=https%3A%2F%2Fwww-cdn.anthropic.com%2Fimages%2F4zrzovbb%2Fwebsite%2Fd48f3ea1218a4b90450b9ab8134fa0e24db5a167-720x542.png&w=1920&q=75',
    title: 'Desktop Extensions',
    subtitle:
      'Desktop Extensions (.dxt files) solve these problems by bundling an entire MCP server, including all dependencies into a single installable package.',
    duration: '10',
    link: 'https://www.anthropic.com/engineering/desktop-extensions'
  },
  {
    img: 'https://gcore.jsdelivr.net/gh/AI-QL/.github@main/public/tuui/index_news.png',
    title: 'TUUI',
    subtitle:
      'Official website for Tool Unitary UI. A desktop LLM chat client designed as MCP integration, accelerating AI adoption through the Model Context Protocol (MCP) and enabling cross-vendor LLM API orchestration',
    duration: '10',
    link: 'https://www.tuui.com/'
  },
  {
    img: 'https://gcore.jsdelivr.net/gh/AI-QL/.github@main/public/tuui/aiql-name.png',
    title: 'AIQL',
    subtitle:
      'AIQL.com provides a suite of tools designed to streamline the development and deployment of AI applications in a cloud-native environment.',
    duration: '15',
    link: 'https://github.com/AI-QL'
  },
  {
    img: 'https://gcore.jsdelivr.net/gh/AI-QL/.github@main/public/tuui/api.png',
    title: 'API Proxy',
    subtitle:
      'API proxy enabling seamless LLM API access by resolving cross-origin and blocking issues, simplifying and streamlining model interaction.',
    duration: '10',
    link: 'https://github.com/AI-QL/openai-proxy-docker'
  }
]

const placeholderColor = computed(() => {
  return (index: number) => {
    const hue = (index * 137.508) % 360 // Evenly distribute hues using golden angle approximation
    const saturation = 30 + Math.sin(index * 0.5) * 20 // 30%~50% saturation (soft pastel tones)
    const lightness = 50 + Math.cos(index * 0.3) * 10 // 40%~60% lightness (avoids extreme brightness)
    return `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Crect width='10' height='6' fill='hsl(${hue}, ${saturation}%, ${lightness}%)'/%3E%3C/svg%3E`
  }
})
</script>

<template>
  <v-data-iterator :items="mcpNews" :items-per-page="-1">
    <template #default="{ items }">
      <v-container class="pa-0" fluid>
        <v-row dense>
          <v-col v-for="(item, index) in items" :key="item.raw.title" cols="auto" md="4">
            <v-card class="pb-3" border flat>
              <v-img
                class="ma-2"
                rounded="lg"
                cover
                :src="item.raw.img"
                :height="140"
                :lazy-src="placeholderColor(index)"
              >
                <template #placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
                  </div>
                </template>
                <template #error>
                  <v-img></v-img>
                </template>
              </v-img>
              <v-divider></v-divider>

              <v-list-item lines="two">
                <template #title>
                  <strong class="text-h6 mb-1">{{ item.raw.title }}</strong>
                </template>
                <template #subtitle>
                  <div class="subtitle-text">{{ item.raw.subtitle }}</div>
                </template>
              </v-list-item>

              <div class="d-flex justify-space-between px-4">
                <div class="d-flex align-center text-caption text-medium-emphasis me-1">
                  <v-icon icon="mdi-clock" start></v-icon>

                  <div class="text-truncate">{{ `${item.raw.duration} ` + $t('mcp.minutes') }}</div>
                </div>

                <v-btn
                  class="text-none"
                  size="small"
                  :text="$t('mcp.read')"
                  variant="flat"
                  border
                  :href="item.raw.link"
                  target="_blank"
                >
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </v-data-iterator>
</template>

<style scoped>
.subtitle-text {
  padding-bottom: 2px;
}
</style>
