# 素材分类剪辑软件

面向电商素材入库、分类、粗剪与导出的桌面端素材分类剪辑软件。

## 项目定位

这是一个基于 Electron + React + Vite 构建的桌面应用，目标是把电商短视频素材处理流程收成一条可执行的本地主链：

- 导入素材
- 分析与分类
- 生成基础版本
- 替换片段
- 导出视频

在基础版主链之上，项目还预留并已接入一部分专业版增强能力：

- API 配置保存
- 文案建议
- 标签增强建议
- 逐条应用标签
- 一键全部应用标签

## 当前能力

### 基础版

- 素材导入
- 本地素材分析与分类
- 粗剪生成
- 版本调整
- 视频导出
- 任务状态查看

### 专业版增强

- 设置页配置 API：`provider / baseUrl / model / apiKey`
- 基于脚本生成文案建议
- 一键复制文案建议
- 基于脚本和当前素材生成标签增强建议
- 逐条应用标签到素材库
- 一键全部应用标签到素材库

## 技术栈

- Electron
- React
- Vite
- TypeScript
- SQLite（better-sqlite3）
- Vitest
- ESLint

## 本地开发

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm run dev
```

### 仅启动前端

```bash
npm run dev:renderer
```

### 桌面调试模式

```bash
npm run dev:electron:debug
```

## 构建与验证

### 运行测试

```bash
npm test
```

### 运行 lint

```bash
npm run lint
```

### 构建前端

```bash
npm run build
```

### 构建 Electron 主进程与 preload

```bash
npm run build:electron
```

### 生成桌面打包目录

```bash
npm run dist
```

### 若打包目录被占用

```bash
npm run release:unlock
```

### 重新打包

```bash
npm run dist:fresh
```

## API 配置说明

在设置页中可以配置：

- 服务商（provider）
- API 地址（baseUrl）
- 模型（model）
- API 密钥（apiKey）

当前配置会保存在 Electron 用户目录下的本地 JSON 文件中。

说明：

- API 密钥不会在界面中完整回显
- 留空保存时会保留已有密钥
- 当前优先支持 OpenAI 兼容接口

## 当前仓库结构

```text
src/
  components/
  pages/
  shared/
  tests/

electron/
  ipc/
  services/
  main.ts
  preload.ts
  preload.cjs
```

## 已验证内容

当前版本已通过：

- `npm test`
- `npm run build`
- `npm run build:electron`
- `npm run lint`

## 说明

这是一个持续演进中的桌面应用版本，当前重点是：

1. 先把基础版主链稳定下来
2. 再逐步增强专业版 API 能力
3. 在保证本地主链可用的前提下扩展 AI 增强功能
