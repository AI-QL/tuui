---
order: 1
---

# 入门

## 克隆项目

使用以下命令克隆该 repo。此方法适用于直接向 TUUI 代码库投稿。

```shell
$ git clone https://github.com/AI-QL/tuui <PROJECT_NAME>
```

## 安装

克隆项目后，在终端运行以下命令:

```shell
# via npm
$ npm i

# via yarn (https://yarnpkg.com)
$ yarn install

# via pnpm (https://pnpm.io)
$ pnpm i
```

## 在开发环境中运行

开发环境中的应用程序通过 **[Vite](https://vitejs.dev)** 运行。

```shell
$ npm run dev
```

如果运行命令行命令后应用程序没有出现，您可能需要检查默认端口是否被其他应用程序使用。

Vite 默认使用端口 `5173`。

## NPM 包更新指南

1. 检查过时的包:

```shell
$ npm outdated
```

2. 使用 `npm-check-updates` 检查可用更新:

```shell
$ npx npm-check-updates
```

3. 更新 `package.json` 文件:

```shell
$ npx npm-check-updates -u
```

4. 安装新版本:

```shell
$ npm install
```

**温馨提示**：完成重要版本更新后，请务必测试您的应用以确保兼容性。

5. (可选) 启用 NPM 镜像 registry

在某些受限地区，可能无法通过默认 registry 下载 Electron。此时可将 registry 切换至 Electron 镜像下载源（例如 `npmmirror.com`）。

> `npmrc.template` 文件中提供了示例配置，将其重命名为 `.npmrc` 即可使用镜像源。

## NPM 版本更新

你可以通过以下方式更新项目版本信息:

```shell
$ npm version <version> --no-git-tag-version
```

**温馨提示**: 请同时更新项目目录和 docs 目录中的版本信息
