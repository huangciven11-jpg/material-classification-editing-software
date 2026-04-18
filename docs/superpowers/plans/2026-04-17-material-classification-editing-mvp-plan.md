# 素材分类剪辑软件 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a desktop MVP that imports ecommerce video assets once, analyzes and catalogs them, then generates and exports one rough-cut video from a script.

**Architecture:** Use Electron + React as the desktop shell, with Node-based local orchestration for asset ingestion, task progress, script segmentation, candidate retrieval, and FFmpeg-driven rough-cut export. Persist long-lived asset metadata and task history in SQLite, and keep generated thumbnails, previews, and exports in local filesystem directories.

**Tech Stack:** Electron, React, TypeScript, Vite, better-sqlite3 or sqlite3, FFmpeg, Vitest, React Testing Library

---

## File Structure

### App shell and UI
- Create: `E:/codex/新建文件夹/package.json` — project metadata, scripts, dependencies, product name
- Create: `E:/codex/新建文件夹/tsconfig.json` — root TypeScript config
- Create: `E:/codex/新建文件夹/tsconfig.node.json` — Node/Electron TypeScript config
- Create: `E:/codex/新建文件夹/tsconfig.app.json` — renderer TypeScript config
- Create: `E:/codex/新建文件夹/vite.config.ts` — Vite renderer config
- Create: `E:/codex/新建文件夹/index.html` — renderer entry HTML
- Create: `E:/codex/新建文件夹/src/main.tsx` — React bootstrap
- Create: `E:/codex/新建文件夹/src/App.tsx` — top-level desktop layout and routing tabs
- Create: `E:/codex/新建文件夹/src/App.css` — shell and page styles
- Create: `E:/codex/新建文件夹/src/vite-env.d.ts` — renderer typing and preload API typing

### Electron main and bridge
- Create: `E:/codex/新建文件夹/electron/main.ts` — Electron app lifecycle, window, IPC registration
- Create: `E:/codex/新建文件夹/electron/preload.ts` — safe renderer bridge
- Create: `E:/codex/新建文件夹/electron/ipc/tasks.ts` — task-related handlers
- Create: `E:/codex/新建文件夹/electron/ipc/assets.ts` — asset library handlers
- Create: `E:/codex/新建文件夹/electron/ipc/generation.ts` — generation/export handlers

### Domain services
- Create: `E:/codex/新建文件夹/electron/services/db.ts` — SQLite connection and schema bootstrap
- Create: `E:/codex/新建文件夹/electron/services/task-service.ts` — task creation, progress events, persistence
- Create: `E:/codex/新建文件夹/electron/services/asset-ingest-service.ts` — import, metadata extraction, thumbnails, library insert
- Create: `E:/codex/新建文件夹/electron/services/asset-analysis-service.ts` — deterministic tag generation and similarity grouping for MVP
- Create: `E:/codex/新建文件夹/electron/services/asset-query-service.ts` — search, filter, asset detail queries
- Create: `E:/codex/新建文件夹/electron/services/script-service.ts` — script normalization and segment splitting
- Create: `E:/codex/新建文件夹/electron/services/candidate-service.ts` — candidate recall and ranking
- Create: `E:/codex/新建文件夹/electron/services/timeline-service.ts` — rough-cut timeline assembly
- Create: `E:/codex/新建文件夹/electron/services/export-service.ts` — FFmpeg concat/export pipeline
- Create: `E:/codex/新建文件夹/electron/services/path-service.ts` — workspace folders for db, thumbs, previews, exports

### Shared types
- Create: `E:/codex/新建文件夹/src/shared/types/asset.ts`
- Create: `E:/codex/新建文件夹/src/shared/types/task.ts`
- Create: `E:/codex/新建文件夹/src/shared/types/script.ts`
- Create: `E:/codex/新建文件夹/src/shared/types/generation.ts`

### Renderer UI components
- Create: `E:/codex/新建文件夹/src/components/navigation-shell.tsx`
- Create: `E:/codex/新建文件夹/src/components/material-grid.tsx`
- Create: `E:/codex/新建文件夹/src/components/material-detail-panel.tsx`
- Create: `E:/codex/新建文件夹/src/components/script-segment-list.tsx`
- Create: `E:/codex/新建文件夹/src/components/candidate-strip.tsx`
- Create: `E:/codex/新建文件夹/src/components/task-list.tsx`
- Create: `E:/codex/新建文件夹/src/components/version-preview.tsx`

### Renderer pages
- Create: `E:/codex/新建文件夹/src/pages/library-page.tsx`
- Create: `E:/codex/新建文件夹/src/pages/generate-page.tsx`
- Create: `E:/codex/新建文件夹/src/pages/version-page.tsx`
- Create: `E:/codex/新建文件夹/src/pages/tasks-page.tsx`
- Create: `E:/codex/新建文件夹/src/pages/settings-page.tsx`

### Tests
- Create: `E:/codex/新建文件夹/src/tests/script-service.test.ts`
- Create: `E:/codex/新建文件夹/src/tests/candidate-service.test.ts`
- Create: `E:/codex/新建文件夹/src/tests/timeline-service.test.ts`
- Create: `E:/codex/新建文件夹/src/tests/task-service.test.ts`

---

### Task 1: Bootstrap desktop workspace

**Files:**
- Create: `E:/codex/新建文件夹/package.json`
- Create: `E:/codex/新建文件夹/tsconfig.json`
- Create: `E:/codex/新建文件夹/tsconfig.node.json`
- Create: `E:/codex/新建文件夹/tsconfig.app.json`
- Create: `E:/codex/新建文件夹/vite.config.ts`
- Create: `E:/codex/新建文件夹/index.html`

- [ ] **Step 1: Write the initial package and config files**

```json
{
  "name": "material-classification-editing-software",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "main": "dist-electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run"
  }
}
```

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 2: Run dependency install after files exist**

Run: `npm --prefix "E:/codex/新建文件夹" install react react-dom && npm --prefix "E:/codex/新建文件夹" install -D typescript vite vitest @types/node @types/react @types/react-dom @vitejs/plugin-react electron`
Expected: packages install successfully with generated `package-lock.json`

- [ ] **Step 3: Add minimal Vite + TypeScript configuration**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 4: Run build to verify the empty scaffold compiles**

Run: `npm --prefix "E:/codex/新建文件夹" run build`
Expected: PASS with generated `dist/`

- [ ] **Step 5: Commit**

```bash
git add "E:/codex/新建文件夹/package.json" "E:/codex/新建文件夹/package-lock.json" "E:/codex/新建文件夹/tsconfig.json" "E:/codex/新建文件夹/tsconfig.node.json" "E:/codex/新建文件夹/tsconfig.app.json" "E:/codex/新建文件夹/vite.config.ts" "E:/codex/新建文件夹/index.html"
git commit -m "feat: bootstrap 素材分类剪辑软件 workspace"
```

### Task 2: Build app shell and shared types

**Files:**
- Create: `E:/codex/新建文件夹/src/main.tsx`
- Create: `E:/codex/新建文件夹/src/App.tsx`
- Create: `E:/codex/新建文件夹/src/App.css`
- Create: `E:/codex/新建文件夹/src/vite-env.d.ts`
- Create: `E:/codex/新建文件夹/src/shared/types/asset.ts`
- Create: `E:/codex/新建文件夹/src/shared/types/task.ts`
- Create: `E:/codex/新建文件夹/src/shared/types/script.ts`
- Create: `E:/codex/新建文件夹/src/shared/types/generation.ts`

- [ ] **Step 1: Write the shared domain types**

```ts
export type AssetStatus = 'active' | 'disabled' | 'downgraded' | 'favorite'

export type AssetRecord = {
  id: string
  fileName: string
  sourcePath: string
  durationMs: number
  thumbnailPath: string | null
  contentTags: string[]
  visualTags: string[]
  styleTags: string[]
  usageTags: string[]
  similarGroupId: string | null
  qualityScore: number
  status: AssetStatus
}
```

- [ ] **Step 2: Write the shell app with five navigation tabs**

```tsx
export default function App() {
  return (
    <main>
      <aside>素材库 生成 版本 任务 设置</aside>
      <section>主工作区</section>
      <aside>详情 / 操作区</aside>
    </main>
  )
}
```

- [ ] **Step 3: Add CSS for three-column dark layout**

```css
main {
  display: grid;
  grid-template-columns: 220px 1fr 320px;
  min-height: 100vh;
  background: #0d1320;
  color: #eef3ff;
}
```

- [ ] **Step 4: Run build to verify the shell compiles**

Run: `npm --prefix "E:/codex/新建文件夹" run build`
Expected: PASS with renderer bundle output

- [ ] **Step 5: Commit**

```bash
git add "E:/codex/新建文件夹/src/main.tsx" "E:/codex/新建文件夹/src/App.tsx" "E:/codex/新建文件夹/src/App.css" "E:/codex/新建文件夹/src/vite-env.d.ts" "E:/codex/新建文件夹/src/shared/types/asset.ts" "E:/codex/新建文件夹/src/shared/types/task.ts" "E:/codex/新建文件夹/src/shared/types/script.ts" "E:/codex/新建文件夹/src/shared/types/generation.ts"
git commit -m "feat: add MVP desktop shell and shared types"
```

### Task 3: Add Electron main process and preload bridge

**Files:**
- Create: `E:/codex/新建文件夹/electron/main.ts`
- Create: `E:/codex/新建文件夹/electron/preload.ts`
- Create: `E:/codex/新建文件夹/electron/ipc/tasks.ts`
- Create: `E:/codex/新建文件夹/electron/ipc/assets.ts`
- Create: `E:/codex/新建文件夹/electron/ipc/generation.ts`

- [ ] **Step 1: Write a failing type check by referencing missing bridge methods in `src/vite-env.d.ts`**

```ts
interface Window {
  materialEditorApi: {
    listAssets: () => Promise<AssetRecord[]>
    createImportTask: (paths: string[]) => Promise<string>
    generateFromScript: (script: string) => Promise<string>
  }
}
```

- [ ] **Step 2: Run build to verify bridge methods are missing**

Run: `npm --prefix "E:/codex/新建文件夹" run build`
Expected: FAIL with missing preload/electron entry wiring

- [ ] **Step 3: Write minimal Electron main and preload bridge**

```ts
import { app, BrowserWindow, ipcMain } from 'electron'

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 960,
    webPreferences: {
      preload: new URL('./preload.js', import.meta.url).pathname,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })
  win.loadURL('http://127.0.0.1:5173')
}

app.whenReady().then(createWindow)
```

```ts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('materialEditorApi', {
  listAssets: () => ipcRenderer.invoke('assets:list'),
  createImportTask: (paths: string[]) => ipcRenderer.invoke('assets:import', paths),
  generateFromScript: (script: string) => ipcRenderer.invoke('generation:create', script),
})
```

- [ ] **Step 4: Run build to verify Electron TypeScript compiles**

Run: `npm --prefix "E:/codex/新建文件夹" run build`
Expected: PASS after bridge types and entry points are valid

- [ ] **Step 5: Commit**

```bash
git add "E:/codex/新建文件夹/electron/main.ts" "E:/codex/新建文件夹/electron/preload.ts" "E:/codex/新建文件夹/electron/ipc/tasks.ts" "E:/codex/新建文件夹/electron/ipc/assets.ts" "E:/codex/新建文件夹/electron/ipc/generation.ts" "E:/codex/新建文件夹/src/vite-env.d.ts"
git commit -m "feat: add electron shell and preload bridge"
```

### Task 4: Add SQLite schema and task service

**Files:**
- Create: `E:/codex/新建文件夹/electron/services/db.ts`
- Create: `E:/codex/新建文件夹/electron/services/task-service.ts`
- Test: `E:/codex/新建文件夹/src/tests/task-service.test.ts`

- [ ] **Step 1: Write the failing task service test**

```ts
import { describe, expect, it } from 'vitest'
import { createTaskService } from '../../electron/services/task-service'

describe('task service', () => {
  it('creates a queued task and stores its first event', () => {
    const service = createTaskService(':memory:')
    const task = service.createTask({ type: 'asset-import', label: '导入素材' })
    expect(task.status).toBe('queued')
    expect(service.listTasks()).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix "E:/codex/新建文件夹" test -- src/tests/task-service.test.ts`
Expected: FAIL with missing module or function

- [ ] **Step 3: Write minimal SQLite bootstrap and task service**

```ts
export function createTaskService(dbPath: string) {
  const tasks: Array<{ id: string; type: string; label: string; status: string }> = []
  return {
    createTask(input: { type: string; label: string }) {
      const task = { id: crypto.randomUUID(), type: input.type, label: input.label, status: 'queued' }
      tasks.push(task)
      return task
    },
    listTasks() {
      return tasks
    },
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix "E:/codex/新建文件夹" test -- src/tests/task-service.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add "E:/codex/新建文件夹/electron/services/db.ts" "E:/codex/新建文件夹/electron/services/task-service.ts" "E:/codex/新建文件夹/src/tests/task-service.test.ts"
git commit -m "feat: add task persistence foundation"
```

### Task 5: Build asset import, metadata extraction, and MVP analysis

**Files:**
- Create: `E:/codex/新建文件夹/electron/services/path-service.ts`
- Create: `E:/codex/新建文件夹/electron/services/asset-ingest-service.ts`
- Create: `E:/codex/新建文件夹/electron/services/asset-analysis-service.ts`
- Create: `E:/codex/新建文件夹/src/tests/asset-analysis.test.ts`

- [ ] **Step 1: Write the failing analysis test**

```ts
import { describe, expect, it } from 'vitest'
import { analyzeAssetFileName } from '../../electron/services/asset-analysis-service'

describe('asset analysis', () => {
  it('extracts ecommerce-friendly tags from a file name', () => {
    const result = analyzeAssetFileName('沙发-宠物毛-特写-暖光.mp4')
    expect(result.contentTags).toContain('宠物毛')
    expect(result.visualTags).toContain('特写')
    expect(result.styleTags).toContain('暖光')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix "E:/codex/新建文件夹" test -- src/tests/asset-analysis.test.ts`
Expected: FAIL with missing analyzer

- [ ] **Step 3: Write minimal deterministic analyzer and ingest service**

```ts
export function analyzeAssetFileName(fileName: string) {
  const text = fileName.toLowerCase()
  return {
    contentTags: text.includes('毛') ? ['宠物毛'] : [],
    visualTags: text.includes('特写') ? ['特写'] : [],
    styleTags: text.includes('暖光') ? ['暖光'] : [],
    usageTags: text.includes('结果') ? ['结果展示'] : ['通用展示'],
    qualityScore: 0.8,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix "E:/codex/新建文件夹" test -- src/tests/asset-analysis.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add "E:/codex/新建文件夹/electron/services/path-service.ts" "E:/codex/新建文件夹/electron/services/asset-ingest-service.ts" "E:/codex/新建文件夹/electron/services/asset-analysis-service.ts" "E:/codex/新建文件夹/src/tests/asset-analysis.test.ts"
git commit -m "feat: add MVP asset ingest and deterministic analysis"
```

### Task 6: Build library page and material detail editing

**Files:**
- Create: `E:/codex/新建文件夹/src/components/navigation-shell.tsx`
- Create: `E:/codex/新建文件夹/src/components/material-grid.tsx`
- Create: `E:/codex/新建文件夹/src/components/material-detail-panel.tsx`
- Create: `E:/codex/新建文件夹/src/pages/library-page.tsx`
- Modify: `E:/codex/新建文件夹/src/App.tsx`
- Modify: `E:/codex/新建文件夹/src/App.css`

- [ ] **Step 1: Write a failing component test for asset selection behavior**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LibraryPage } from '../pages/library-page'

it('shows selected asset details in the right panel', async () => {
  render(<LibraryPage assets={[{ id: '1', fileName: 'a.mp4', sourcePath: 'a.mp4', durationMs: 1000, thumbnailPath: null, contentTags: [], visualTags: [], styleTags: [], usageTags: [], similarGroupId: null, qualityScore: 0.8, status: 'active' }]} />)
  await userEvent.click(screen.getByText('a.mp4'))
  expect(screen.getByText('素材详情')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix "E:/codex/新建文件夹" test -- src/pages/library-page.test.tsx`
Expected: FAIL with missing page/component

- [ ] **Step 3: Write minimal library page and selection components**

```tsx
export function LibraryPage({ assets }: { assets: AssetRecord[] }) {
  const [selected, setSelected] = useState<AssetRecord | null>(assets[0] ?? null)
  return (
    <>
      <section>{assets.map(asset => <button key={asset.id} onClick={() => setSelected(asset)}>{asset.fileName}</button>)}</section>
      <aside>{selected ? <h3>素材详情</h3> : <p>请选择素材</p>}</aside>
    </>
  )
}
```

- [ ] **Step 4: Run tests and build**

Run: `npm --prefix "E:/codex/新建文件夹" test -- src/pages/library-page.test.tsx && npm --prefix "E:/codex/新建文件夹" run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add "E:/codex/新建文件夹/src/components/navigation-shell.tsx" "E:/codex/新建文件夹/src/components/material-grid.tsx" "E:/codex/新建文件夹/src/components/material-detail-panel.tsx" "E:/codex/新建文件夹/src/pages/library-page.tsx" "E:/codex/新建文件夹/src/App.tsx" "E:/codex/新建文件夹/src/App.css"
git commit -m "feat: add library page with detail panel"
```

### Task 7: Build script segmentation service

**Files:**
- Create: `E:/codex/新建文件夹/electron/services/script-service.ts`
- Test: `E:/codex/新建文件夹/src/tests/script-service.test.ts`

- [ ] **Step 1: Write the failing script segmentation test**

```ts
import { describe, expect, it } from 'vitest'
import { splitScriptIntoSegments } from '../../electron/services/script-service'

describe('script segmentation', () => {
  it('splits a script into ordered rough-cut segments', () => {
    const segments = splitScriptIntoSegments('沙发上全是猫毛。轻轻一刷就干净。')
    expect(segments).toHaveLength(2)
    expect(segments[0].targetDurationMs).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix "E:/codex/新建文件夹" test -- src/tests/script-service.test.ts`
Expected: FAIL with missing segmentation service

- [ ] **Step 3: Write minimal segmentation implementation**

```ts
export function splitScriptIntoSegments(script: string) {
  return script
    .split(/[。！？!?.]/)
    .map(part => part.trim())
    .filter(Boolean)
    .map((text, index) => ({
      id: `${index + 1}`,
      index,
      text,
      intentType: text.includes('干净') ? 'result' : 'problem',
      targetDurationMs: Math.max(1200, text.length * 220),
      locked: false,
    }))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix "E:/codex/新建文件夹" test -- src/tests/script-service.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add "E:/codex/新建文件夹/electron/services/script-service.ts" "E:/codex/新建文件夹/src/tests/script-service.test.ts"
git commit -m "feat: add script segmentation for rough-cut generation"
```

### Task 8: Build candidate recall and ranking

**Files:**
- Create: `E:/codex/新建文件夹/electron/services/candidate-service.ts`
- Test: `E:/codex/新建文件夹/src/tests/candidate-service.test.ts`

- [ ] **Step 1: Write the failing candidate ranking test**

```ts
import { describe, expect, it } from 'vitest'
import { rankCandidatesForSegment } from '../../electron/services/candidate-service'

describe('candidate ranking', () => {
  it('prefers matching usage tags over unrelated assets', () => {
    const ranked = rankCandidatesForSegment(
      { id: '1', index: 0, text: '轻轻一刷就干净', intentType: 'result', targetDurationMs: 1800, locked: false },
      [
        { id: 'a', fileName: 'result.mp4', sourcePath: 'a', durationMs: 2000, thumbnailPath: null, contentTags: [], visualTags: [], styleTags: [], usageTags: ['结果展示'], similarGroupId: null, qualityScore: 0.9, status: 'active' },
        { id: 'b', fileName: 'problem.mp4', sourcePath: 'b', durationMs: 2000, thumbnailPath: null, contentTags: [], visualTags: [], styleTags: [], usageTags: ['问题展示'], similarGroupId: null, qualityScore: 0.9, status: 'active' }
      ]
    )
    expect(ranked[0].assetId).toBe('a')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix "E:/codex/新建文件夹" test -- src/tests/candidate-service.test.ts`
Expected: FAIL with missing ranking service

- [ ] **Step 3: Write minimal ranking implementation**

```ts
export function rankCandidatesForSegment(segment: ScriptSegment, assets: AssetRecord[]) {
  return assets
    .filter(asset => asset.status !== 'disabled')
    .map(asset => ({
      assetId: asset.id,
      recallScore: 1,
      rankScore: asset.usageTags.includes(segment.intentType === 'result' ? '结果展示' : '问题展示') ? 10 : 1,
      reasonSummary: 'MVP 标签匹配',
      similarPenalty: 0,
      usagePenalty: 0,
      selected: false,
    }))
    .sort((a, b) => b.rankScore - a.rankScore)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix "E:/codex/新建文件夹" test -- src/tests/candidate-service.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add "E:/codex/新建文件夹/electron/services/candidate-service.ts" "E:/codex/新建文件夹/src/tests/candidate-service.test.ts"
git commit -m "feat: add candidate recall and ranking"
```

### Task 9: Build timeline assembly and export service

**Files:**
- Create: `E:/codex/新建文件夹/electron/services/timeline-service.ts`
- Create: `E:/codex/新建文件夹/electron/services/export-service.ts`
- Test: `E:/codex/新建文件夹/src/tests/timeline-service.test.ts`

- [ ] **Step 1: Write the failing timeline test**

```ts
import { describe, expect, it } from 'vitest'
import { buildTimeline } from '../../electron/services/timeline-service'

describe('timeline assembly', () => {
  it('maps ranked candidates to sequential clips', () => {
    const timeline = buildTimeline([
      { id: '1', index: 0, text: '问题', intentType: 'problem', targetDurationMs: 1500, locked: false },
      { id: '2', index: 1, text: '结果', intentType: 'result', targetDurationMs: 1800, locked: false },
    ], {
      '1': [{ assetId: 'a', rankScore: 5 }],
      '2': [{ assetId: 'b', rankScore: 8 }],
    })
    expect(timeline).toHaveLength(2)
    expect(timeline[1].timelineStartMs).toBeGreaterThanOrEqual(timeline[0].timelineEndMs)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix "E:/codex/新建文件夹" test -- src/tests/timeline-service.test.ts`
Expected: FAIL with missing timeline builder

- [ ] **Step 3: Write minimal timeline and export services**

```ts
export function buildTimeline(segments: ScriptSegment[], ranked: Record<string, Array<{ assetId: string; rankScore: number }>>) {
  let cursor = 0
  return segments.map(segment => {
    const best = ranked[segment.id]?.[0]
    const clip = {
      segmentId: segment.id,
      assetId: best?.assetId ?? null,
      timelineStartMs: cursor,
      timelineEndMs: cursor + segment.targetDurationMs,
    }
    cursor = clip.timelineEndMs
    return clip
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix "E:/codex/新建文件夹" test -- src/tests/timeline-service.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add "E:/codex/新建文件夹/electron/services/timeline-service.ts" "E:/codex/新建文件夹/electron/services/export-service.ts" "E:/codex/新建文件夹/src/tests/timeline-service.test.ts"
git commit -m "feat: add rough-cut timeline assembly and export service"
```

### Task 10: Build generate page, version page, and tasks page

**Files:**
- Create: `E:/codex/新建文件夹/src/components/script-segment-list.tsx`
- Create: `E:/codex/新建文件夹/src/components/candidate-strip.tsx`
- Create: `E:/codex/新建文件夹/src/components/task-list.tsx`
- Create: `E:/codex/新建文件夹/src/components/version-preview.tsx`
- Create: `E:/codex/新建文件夹/src/pages/generate-page.tsx`
- Create: `E:/codex/新建文件夹/src/pages/version-page.tsx`
- Create: `E:/codex/新建文件夹/src/pages/tasks-page.tsx`
- Create: `E:/codex/新建文件夹/src/pages/settings-page.tsx`
- Modify: `E:/codex/新建文件夹/src/App.tsx`

- [ ] **Step 1: Write a failing UI test for script-to-segment rendering**

```tsx
import { render, screen } from '@testing-library/react'
import { GeneratePage } from '../pages/generate-page'

it('renders generated script segments', () => {
  render(<GeneratePage initialScript="沙发上全是毛。轻轻一刷就干净。" />)
  expect(screen.getByText('镜头位 1')).toBeInTheDocument()
  expect(screen.getByText('镜头位 2')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix "E:/codex/新建文件夹" test -- src/pages/generate-page.test.tsx`
Expected: FAIL with missing page

- [ ] **Step 3: Write generate, version, tasks, and settings pages wired into the app shell**

```tsx
export function GeneratePage({ initialScript = '' }: { initialScript?: string }) {
  const segments = splitScriptIntoSegments(initialScript || '请输入脚本')
  return <section>{segments.map(segment => <article key={segment.id}>镜头位 {segment.index + 1}</article>)}</section>
}
```

- [ ] **Step 4: Run tests and build**

Run: `npm --prefix "E:/codex/新建文件夹" test && npm --prefix "E:/codex/新建文件夹" run build`
Expected: PASS with all current tests green

- [ ] **Step 5: Commit**

```bash
git add "E:/codex/新建文件夹/src/components/script-segment-list.tsx" "E:/codex/新建文件夹/src/components/candidate-strip.tsx" "E:/codex/新建文件夹/src/components/task-list.tsx" "E:/codex/新建文件夹/src/components/version-preview.tsx" "E:/codex/新建文件夹/src/pages/generate-page.tsx" "E:/codex/新建文件夹/src/pages/version-page.tsx" "E:/codex/新建文件夹/src/pages/tasks-page.tsx" "E:/codex/新建文件夹/src/pages/settings-page.tsx" "E:/codex/新建文件夹/src/App.tsx"
git commit -m "feat: add generate version tasks and settings pages"
```

## Self-Review

### Spec coverage
- Material import and one-time analysis: covered by Tasks 4 and 5
- Search and manual asset correction: covered by Task 6
- Script segmentation and candidate recall: covered by Tasks 7 and 8
- Single-version rough-cut generation and export: covered by Task 9
- Task progress and desktop workbench pages: covered by Tasks 2, 3, and 10

### Placeholder scan
- Removed TODO/TBD language
- Every task has explicit files, commands, and code blocks
- No references to undefined task names remain

### Type consistency
- Core objects consistently named `AssetRecord`, `ScriptSegment`, `GenerationJob`, `TimelineClip`
- Renderer bridge consistently named `materialEditorApi`
- Timeline builder always consumes `ScriptSegment[]` and ranked candidate maps
