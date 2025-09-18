# AGENTS Guidelines for This Repository

This repository contains an Electron application located in the root of this repository. When working on the project interactively with an agent (e.g. Codex, Claude Code) please follow the guidelines below so that the development experience – in particular Hot Module Replacement (HMR) – continues to work smoothly.

## 1. Use the Development Server, **not** `npm run build`

- **Always use `npm run dev`** while iterating on the application. This starts Electron in development mode by Vite with hot-reload enabled.

- **Do _not_ run `npm run build` inside the agent session.** If a production build is required, do it outside of the interactive agent workflow.

## 2. Keep Dependencies in Sync

If you add or update dependencies remember to:

1. Update the appropriate lockfile (`package-lock.json`).
2. Re-start the development server so that Vite picks up the changes.

## 3. Coding Conventions

- Prefer TypeScript (`.vue`/`.ts`) for new components and utilities.
- Co-locate component-specific styles in the same folder as the component when practical.
- For Vue-related components, prefer Vue 3 with the script setup syntax.
- Use Pinia as the preferred state management.

## 4. Project Structure

- When adding new files, be mindful of the differences between the renderer, main, and preload processes.
- For components required by the renderer, most can be reused from Vuetify.js’s existing components — only create new ones when absolutely necessary.
- For components needed by the main process, most can be reused from Electron’s built‑in APIs.
- After adding new files, re-start the development server so that Vite picks up the changes.

## 5. Useful Commands Recap

| Command             | Purpose                                                   |
| ------------------- | --------------------------------------------------------- |
| `npm run dev`       | Start the Vite dev server with HMR.                       |
| `npm run lint:fix`  | Run ESLint checks and fix.                                |
| `npm run test`      | Execute the test suite.                                   |
| `npm run build:pre` | **Production build – _do not run during agent sessions_** |

---

Following these practices ensures that the agent-assisted development workflow stays fast and dependable. When in doubt, restart the dev server rather than running the production build.
