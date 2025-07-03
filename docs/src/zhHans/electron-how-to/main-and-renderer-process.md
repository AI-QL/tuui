# 主流程与渲染器流程

一个**Electron**应用程序被分为代码，分为主进程和渲染器进程。

**“主”**是`src/main`的代码，主要是由Electron处理的进程代码。**“渲染器”**是`src/renderer`的代码，主要用于前端渲染过程，如Vue。

一般来说，**Node.js**脚本无法在渲染器进程中运行。例如，包含Node.js使用的API的模块，或**Node.js**的本机模块，如`path`或`net`、`os`或`crypto`。

预加载脚本在渲染器加载之前运行。它为主进程创建了一个桥梁，出于安全考虑，将Node.js脚本的执行与渲染器区域分开并隔离。

为了安全执行脚本，建议主进程执行Node脚本，渲染器通过消息传递接收执行结果。这可以通过**IPC通信**来实现。

欲了解更多信息，请参阅以下文章: https://www.electronjs.org/docs/latest/tutorial/ipc

### 如何在渲染器上运行Node.js？

如果您想跳过安全问题并在渲染器中使用 Node.js 脚本，需要在 `vite.config.ts` 文件中将 `nodeIntegration` 设置为 `true`。

```javascript
rendererPlugin({
  nodeIntegration: true
})
```

欲了解更多信息，请参阅以下文章: https://github.com/electron-vite/vite-plugin-electron-renderer

### 如何解决开发环境中的CORS限制问题？

默认情况下，WebSecurity功能（定义在`DEFAULT_WEB_PREFERENCES`）会启用生产级安全防护。但在后端开发/调试过程中：

- 若出现以下情况可临时关闭webSecurity：
  - 后端未配置CORS响应头（如Access-Control-Allow-Origin等）

  - OPTIONS预检请求被302重定向（非标准处理方式）

此操作将允许直接向聊天补全API发起POST请求，绕过浏览器强制的CORS限制。

> [!WARNING] 本方案仅限本地开发环境使用。部署至生产环境前务必重新启用webSecurity功能。

欲了解更多信息，请参阅以下文章: https://www.electronjs.org/zh/docs/latest/tutorial/security
