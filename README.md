# TUUI

#### A Tool-Unified User Interface accelerating AI tool integration via MCP (Model Context Protocol) and orchestrating cross-vendor LLM APIs

## :bulb: Introduction

This repository is essentially an **LLM chat desktop application based on MCP**. It also represents a bold experiment in **creating a complete project using AI**. Many components within the project have been directly converted or generated from the prototype project through AI.

Given the considerations regarding the quality and safety of AI-generated content, this project employs strict syntax checks and naming conventions. Therefore, for any further development, please ensure that you use the linting tools I've set up to check and automatically fix syntax issues.

## :sparkles: Features

- :sparkles: Accelerate AI tool integration via MCP
- :sparkles: Orchestrate cross-vendor LLM APIs through dynamic configuring
- :sparkles: Automated application testing Support
- :sparkles: TypeScript support
- :sparkles: Multilingual support
- :sparkles: Basic layout manager
- :sparkles: Global state management through the Pinia store
- :sparkles: Quick support through the GitHub community and official documentation

## :book: Getting Started

To explore the project, please check wiki page: [TUUI.com](https://www.tuui.com)

You can also check the documentation of the current project in sections: [Getting Started](docs/src/en/installation-and-build/getting-started.md) | [快速入门](/docs/src/zhHans/installation-and-build/getting-started.md)

For features related to MCP, you'll need to set up your own LLM backend that supports tool calls.

For guidance on configuring the LLM, refer to the template(i.e.: Qwen):

```json
{
  "chatbotStore": {
    "chatbots": [
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
    ]
  }
}
```

The full config and corresponding types could be found in: [Config Type](/src/renderer/types/index.ts)

Once you modify or import the LLM configuration, it will be stored in your localStorage by default. You can use the developer tools to view or clear the corresponding cache.

## :inbox_tray: Contributing

We welcome contributions of any kind to this project, including feature enhancements, UI improvements, documentation updates, test case completions, and syntax corrections. I believe that a real developer can write better code than AI, so if you have concerns about certain parts of the code implementation, feel free to share your suggestions or submit a pull request.

Please review our [Code of Conduct](CODE_OF_CONDUCT.md). It is in effect at all times. We expect it to be honored by everyone who contributes to this project.

For more information, please see [Contributing Guidelines](CONTRIBUTING.md)

## :beetle: Opening an Issue

Before creating an issue, check if you are using the latest version of the project. If you are not up-to-date, see if updating fixes your issue first.

### :lock: Reporting Security Issues

Review our [Security Policy](SECURITY.md). Do not file a public issue for security vulnerabilities.

## :pray: Credits

Written by [@AIQL.com](https://github.com/AI-QL).

Many of the ideas and prose for the statements in this project were based on or inspired by work from the following communities:

- [Specifications and References](https://www.tuui.com/project-structures/specification-references)

You can review the specific technical details and the license. We commend them for their efforts to facilitate collaboration in their projects.
