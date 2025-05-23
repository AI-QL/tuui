# Main vs Renderer Process

A **Electron** application is divided into code into a Main process and a Renderer process.

**"Main"** is the code of `src/main` and is mainly the process code handled by Electron. **"Renderer"** is the code of `src/renderer`, mainly for front-end rendering process like Vue.

In general, **Node.js** scripts cannot be run in the renderer process. Examples include modules that contain APIs used by Node.js, or native modules of **Node.js** such as `path` or `net`, `os` or `crypto`.

Preload scripts are run before the renderer is loaded. It creates a bridge to the main process to keep the execution of Node.js scripts in the renderer area separate and isolated for security reasons.

For secure script execution, it is recommended that the main process executes the Node scripts, and the renderer receives the execution results via messaging. This can be implemented via **IPC communication**.

For more information on this, see the following articles: https://www.electronjs.org/docs/latest/tutorial/ipc

### How to run Node.js on a renderer?

If you want to skip the security issues and use Node.js scripts in your renderer, you need to set `nodeIntegration` to `true` in your `vite.config.ts` file.

```javascript
rendererPlugin({
  nodeIntegration: true
})
```

For more information on this, see the following articles: https://github.com/electron-vite/vite-plugin-electron-renderer

### How to handle CORS restrictions in development?

WebSecurity is enabled by default (in `DEFAULT_WEB_PREFERENCES`) for production-grade security. However, during backend development/debugging:

- Temporarily disable webSecurity if:
  - Backend lacks CORS headers (Access-Control-Allow-Origin, etc.)
  - Preflight OPTIONS requests receive 302 redirects (non-standard handling)

This allows direct POST requests to chat completions API without browser-enforced CORS restrictions.

> [!WARNING] Only use this workaround for local development. Please re-enable webSecurity before deploying to production environments.

For more information on this, see the following articles: https://www.electronjs.org/docs/latest/tutorial/security
