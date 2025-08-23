# <img src="https://cdn.jsdelivr.net/gh/AI-QL/tuui@main/buildAssets/icons/icon.png" alt="Logo" width="24"/> TUUI - Tool Unitary User Interface

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/AI-QL/tuui) [![](https://camo.githubusercontent.com/077907eb137aa9b2d46ca4af30b77714cb69225eb8be49ad89f3e0ae668c90ca/68747470733a2f2f62616467652e6d6370782e6465763f747970653d636c69656e74)](https://modelcontextprotocol.io/clients#aiql-tuui) [![](https://img.shields.io/badge/Vue3-brightgreen.svg)](https://vuejs.org) [![](https://img.shields.io/badge/Vuetify-blue.svg)](https://vuetifyjs.com) [![LICENSE](https://img.shields.io/github/license/AI-QL/tuui)](https://github.com/AI-QL/tuui/blob/main/LICENSE)

#### TUUI is a desktop MCP client designed as a tool unitary utility integration, accelerating AI adoption through the Model Context Protocol (MCP) and enabling cross-vendor LLM API orchestration.

## 📜 Introduction

This repository is essentially an **LLM chat desktop application based on MCP**. It also represents a bold experiment in **creating a complete project using AI**. Many components within the project have been directly converted or generated from the prototype project through AI.

Given the considerations regarding the quality and safety of AI-generated content, this project employs strict syntax checks and naming conventions. Therefore, for any further development, please ensure that you use the linting tools I've set up to check and automatically fix syntax issues.

## ✨ Features

- ✨ Accelerate AI tool integration via MCP
- ✨ Orchestrate cross-vendor LLM APIs through dynamic configuring
- ✨ Automated application testing Support
- ✨ TypeScript support
- ✨ Multilingual support
- ✨ Basic layout manager
- ✨ Global state management through the Pinia store
- ✨ Quick support through the GitHub community and official documentation

## 🚀 Getting Started

You can quickly get started with the project through a variety of options tailored to your role and needs:

- To `explore` the project, visit the wiki page: [TUUI.com](https://www.tuui.com)

- To `download` and use the application directly, go to the releases page: [Releases](https://github.com/AI-QL/tuui/releases)

- For `developer` setup, refer to the installation guide: [Getting Started (English)](docs/src/en/installation-and-build/getting-started.md) | [快速入门 (中文)](docs/src/zhHans/installation-and-build/getting-started.md)

- To `ask the AI` directly about the project, visit: [TUUI@DeepWiki](https://deepwiki.com/AI-QL/tuui)

## ⚙️ Core Requirements

**To use MCP-related features, ensure the following preconditions are met for your environment:**

- Set up an LLM backend (e.g., `ChatGPT`, `Claude`, `Qwen` or self-hosted) that supports tool/function calling.

- For NPX/NODE-based servers: Install `Node.js` to execute JavaScript/TypeScript tools.

- For UV/UVX-based servers: Install `Python` and the `UV` library.

- For Docker-based servers: Install `DockerHub`.

- For macOS/Linux systems: Modify the default MCP configuration (e.g., adjust CLI paths or permissions).
  > Refer to the [MCP Server Issue](#mcp-server-issue) documentation for guidance

For guidance on configuring the LLM, refer to the template(i.e.: Qwen):

```json
{
  "name": "Qwen",
  "apiKey": "",
  "url": "https://dashscope.aliyuncs.com/compatible-mode",
  "path": "/v1/chat/completions",
  "model": "qwen-turbo",
  "modelList": ["qwen-turbo", "qwen-plus", "qwen-max"],
  "maxTokensValue": "",
  "mcp": true
}
```

The configuration accepts either a JSON object (for a single chatbot) or a JSON array (for multiple chatbots):

```json
[
  {
    "name": "Openrouter && Proxy",
    "apiKey": "",
    "url": "https://api3.aiql.com",
    "urlList": ["https://api3.aiql.com", "https://openrouter.ai/api"],
    "path": "/v1/chat/completions",
    "model": "openai/gpt-4.1-mini",
    "modelList": [
      "openai/gpt-4.1-mini",
      "openai/gpt-4.1",
      "anthropic/claude-sonnet-4",
      "google/gemini-2.5-pro-preview"
    ],
    "maxTokensValue": "",
    "mcp": true
  },
  {
    "name": "DeepInfra",
    "apiKey": "",
    "url": "https://api.deepinfra.com",
    "path": "/v1/openai/chat/completions",
    "model": "Qwen/Qwen3-32B",
    "modelList": [
      "Qwen/Qwen3-32B",
      "Qwen/Qwen3-235B-A22B",
      "meta-llama/Meta-Llama-3.1-70B-Instruct"
    ],
    "mcp": true
  }
]
```

The full config and corresponding types could be found in: [Config Type](/src/preload/llm.d.ts) and [Default Config](/src/main/assets/config/llm.json).

For the decomposable package, you can also modify the default configuration of the built release in `resources/assets/config/llm.json`

Once you modify or import the LLM configuration, it will be stored in your localStorage by default. You can use the developer tools to view or clear the corresponding cache.

## 🌐 Remote MCP server

You can utilize Cloudflare's recommended [mcp-remote](https://github.com/geelen/mcp-remote) to implement the full suite of remote MCP server functionalities (including Auth). For example, simply add the following to your [config.json](src/main/assets/config/config.json) file:

```json
{
  "mcpServers": {
    "cloudflare": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://YOURDOMAIN.com/sse"]
    }
  }
}
```

In this example, I have provided a test remote server: `https://YOURDOMAIN.com` on [Cloudflare](https://blog.cloudflare.com/remote-model-context-protocol-servers-mcp/). This server will always approve your authentication requests.

If you encounter any issues (please try to maintain OAuth auto-redirect to prevent callback delays that might cause failures), such as the common HTTP 400 error. You can resolve them by clearing your browser cache on the authentication page and then attempting verification again:

![](https://gcore.jsdelivr.net/gh/AI-QL/.github/public/tuui/7.png)

<a id="mcp-server-issue"></a>

## 🚸 MCP Server Issue

When launching the MCP server, if you encounter spawn errors like `ENOENT`, try installing the corresponding MCP server locally and invoking it using an absolute path.

This is a known issue, and many cases remain unresolved. The MCP SDK includes a workaround specifically for `Windows` systems, as documented in [ISSUE 101](https://github.com/modelcontextprotocol/typescript-sdk/issues/101).

### Window

- [ISSUE 40 - MCP servers fail to connect with npx on Windows](https://github.com/modelcontextprotocol/servers/issues/40) (fixed)

### MacOS

- [ISSUE 64 - MCP Servers Don't Work with NVM](https://github.com/modelcontextprotocol/servers/issues/64) (still open)

The issue remains unresolved on other platforms, specifically `macOS`. Although several workarounds are available, this ticket consolidates the most effective ones and highlights the simplest method: [How to configure MCP on macOS](https://github.com/AI-QL/tuui/issues/2).

## 🤝 Contributing

We welcome contributions of any kind to this project, including feature enhancements, UI improvements, documentation updates, test case completions, and syntax corrections. I believe that a real developer can write better code than AI, so if you have concerns about certain parts of the code implementation, feel free to share your suggestions or submit a pull request.

Please review our [Code of Conduct](CODE_OF_CONDUCT.md). It is in effect at all times. We expect it to be honored by everyone who contributes to this project.

For more information, please see [Contributing Guidelines](CONTRIBUTING.md)

## 🙋 Opening an Issue

Before creating an issue, check if you are using the latest version of the project. If you are not up-to-date, see if updating fixes your issue first.

### 🔒️ Reporting Security Issues

Review our [Security Policy](SECURITY.md). Do not file a public issue for security vulnerabilities.

## 🎉 Demo

### MCP primitive visualization

![](https://gcore.jsdelivr.net/gh/AI-QL/.github/public/tuui2/1_primitive.jpg)

### Desktop extensions (.dxt) support

![](https://gcore.jsdelivr.net/gh/AI-QL/.github/public/tuui2/2_dxt.jpg)

### MCP Tool call tracing

![](https://gcore.jsdelivr.net/gh/AI-QL/.github/public/tuui2/3_chat.jpg)

### Agent with specified tool selection

![](https://gcore.jsdelivr.net/gh/AI-QL/.github/public/tuui2/4_agent.jpg)

### LLM API setting

![](https://gcore.jsdelivr.net/gh/AI-QL/.github/public/tuui2/5_llmconfig.jpg)

### MCP elicitation

![](https://gcore.jsdelivr.net/gh/AI-QL/.github/public/tuui2/6_elicit.jpg)

### Native devtools

![](https://gcore.jsdelivr.net/gh/AI-QL/.github/public/tuui2/7_devtool.jpg)

## 🙏 Credits

Written by [@AIQL.com](https://github.com/AI-QL).

Many of the ideas and prose for the statements in this project were based on or inspired by work from the following communities:

- [Specifications and References](https://www.tuui.com/project-structures/specification-references)

You can review the specific technical details and the license. We commend them for their efforts to facilitate collaboration in their projects.
