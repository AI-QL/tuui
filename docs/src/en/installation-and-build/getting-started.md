---
order: 1
---

# Getting Started

## Clone project

Clone this repo using below command. This method is suitable for direct contributions to the TUUI repository.

```shell
$ git clone https://github.com/AI-QL/tuui <PROJECT_NAME>
```

## Installation

After cloning the project, run the following command in the terminal:

```shell
# via npm
$ npm i

# via yarn (https://yarnpkg.com)
$ yarn install

# via pnpm (https://pnpm.io)
$ pnpm i
```

## Run in development environment

Applications in the development environment run through **[Vite](https://vitejs.dev)**.

```shell
$ npm run dev
```

If your application doesn't appear after running command line commands, you may need to review if the default port is being used by another app.

Vite uses port `5173` by default.

## Update NPM Packages

1. Check for outdated packages:

```shell
$ npm outdated
```

2. Check available updates using `npm-check-updates`:

```shell
$ npx npm-check-updates
```

3. Upgrade your `package.json`:

```shell
$ npx npm-check-updates -u
```

4. Install the new versions:

```shell
$ npm install
```

**Pro Tip**: Always test your application after major updates to ensure compatibility.

## Update NPM Version

You can update the version info by:

```shell
$ npm version <version> --no-git-tag-version
```

**Pro Tip**: Update the version info in both the project and docs directories.
