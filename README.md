# Chameo（查咩）

网页英语学习助手 — 标注生词与语法结构的浏览器插件。

## 技术栈

- [WXT](https://wxt.dev) — 浏览器插件开发框架（基于 Vite）
- React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- `@webext-core/messaging` — 类型安全的消息通信
- `@webext-core/storage` — 响应式扩展存储

## 快速开始

```bash
pnpm install
pnpm dev          # 启动 Chrome 开发模式（自动加载插件）
```

## 多浏览器开发

```bash
pnpm dev              # Chrome（默认）
pnpm dev:firefox      # Firefox
pnpm dev:edge         # Edge
```

## 构建与打包

```bash
pnpm build            # 构建 Chrome 版本
pnpm build:all        # 构建所有浏览器版本
pnpm zip              # 打包 Chrome 版本（用于提交商店）
pnpm zip:all          # 打包所有浏览器版本
```

## 项目结构

```
chameo/
├── src/
│   ├── entrypoints/
│   │   ├── popup/           # 弹出窗口
│   │   ├── options/         # 设置页面
│   │   ├── sidepanel/       # 侧边栏
│   │   ├── background.ts    # 后台 Service Worker
│   │   └── content.ts       # 内容脚本（注入网页）
│   ├── components/ui/       # shadcn/ui 组件
│   ├── hooks/               # React Hooks
│   ├── utils/               # 工具函数（messaging、storage 等）
│   └── assets/              # 样式和静态资源
├── public/icon/             # 插件图标
├── wxt.config.ts            # WXT 配置
└── components.json          # shadcn/ui 配置
```
