# Chameo（查咩）

网页英语学习助手。

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发模式（自动打开 Chrome 并加载插件）
pnpm dev
```

插件会自动安装到浏览器中，修改代码后 HMR 即时生效。

## 多浏览器开发

```bash
pnpm dev              # Chrome（默认）
pnpm dev:firefox      # Firefox
pnpm dev:edge         # Edge
```

## 构建与打包

```bash
pnpm build            # 构建 Chrome
pnpm build:all        # 构建 Chrome + Firefox + Edge

pnpm zip              # 打包 Chrome（用于提交商店）
pnpm zip:all          # 打包所有浏览器
```

构建产物位于 `.output/` 目录。

## 技术栈

| 类别 | 选型 |
|------|------|
| 插件框架 | [WXT](https://wxt.dev)（基于 Vite，自动生成 manifest，支持 HMR） |
| UI | React 19 + TypeScript |
| 样式 | Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) |
| 消息通信 | [@webext-core/messaging](https://github.com/nicedoc/webext-core) — 类型安全 |
| 存储 | [@webext-core/storage](https://github.com/nicedoc/webext-core) — 响应式 |
| 国际化 | [react-i18next](https://react.i18next.com) + 浏览器原生 `_locales` |

## 项目结构

```
chameo/
├── src/
│   ├── entrypoints/           # 插件入口点（WXT 自动注册到 manifest）
│   │   ├── popup/             #   弹出窗口 — 点击插件图标打开
│   │   ├── options/           #   设置页面 — 插件配置
│   │   ├── sidepanel/         #   侧边栏 — 常驻释义和语法分析面板
│   │   ├── background.ts      #   后台 Service Worker — 消息路由、存储管理
│   │   └── content.ts         #   内容脚本 — 注入网页，监听文本选中
│   ├── components/ui/         # shadcn/ui 组件
│   ├── hooks/                 # React Hooks（useExtStorage 等）
│   ├── utils/                 # 工具函数
│   │   ├── messaging.ts       #   类型安全的消息协议定义
│   │   ├── storage.ts         #   存储 schema（设置、生词本）
│   │   └── cn.ts              #   Tailwind class 合并工具
│   ├── i18n/                  # 国际化
│   │   ├── index.ts           #   i18next 初始化
│   │   └── locales/           #   翻译文件（zh-CN、en）
│   └── assets/
│       └── globals.css        # Tailwind + shadcn/ui 主题变量
├── public/
│   ├── icon/                  # 插件图标（16/32/48/96/128px）
│   └── _locales/              # 浏览器原生 i18n（manifest 名称/描述）
├── wxt.config.ts              # WXT 主配置
├── components.json            # shadcn/ui 配置
├── tsconfig.json
└── package.json
```

## 架构

```
┌─────────────┐     ┌──────────────────┐     ┌───────────────┐
│   Popup     │────▶│                  │────▶│ Content Script│
│   Options   │────▶│   Background     │     │  （注入网页）  │
│   SidePanel │────▶│  Service Worker  │◀────│   选中文本     │
└─────────────┘     │                  │     └───────────────┘
                    │  · 消息路由       │
                    │  · chrome.storage │
                    └──────────────────┘
```

- **Content Script** 注入到所有网页，监听用户选中文本事件
- **Background** 作为消息中枢，连接各 UI 和 Content Script
- **Popup / SidePanel / Options** 为独立的 React 应用，通过消息与 Background 通信

## 添加 shadcn/ui 组件

```bash
npx shadcn@latest add <component-name>
```

注意：生成的组件可能需要将 `import { cn } from "@/utils"` 修改为 `import { cn } from "@/utils/cn"`。

## 国际化

当前默认语言为中文（`zh-CN`），已预留英文翻译骨架。

**添加新语言：**

1. 在 `src/i18n/locales/` 下新建语言文件（如 `ja.json`）
2. 在 `src/i18n/index.ts` 的 `resources` 中注册
3. 在 `public/_locales/` 下新建对应目录和 `messages.json`

**在组件中使用：**

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <p>{t('common.appName')}</p>;
}
```

## 浏览器兼容性

| 浏览器 | Manifest | 状态 |
|--------|----------|------|
| Chrome / Edge / Brave / Arc | MV3 | 支持 |
| Firefox | MV2 / MV3 | 支持（WXT 自动适配） |
| Safari | MV3 | 需通过 Xcode 转换 |

## License

MIT
