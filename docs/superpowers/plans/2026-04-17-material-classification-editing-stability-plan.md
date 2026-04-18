# 素材分类剪辑软件稳定性收口 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing desktop MVP stable to develop, package, rerun, and verify repeatedly on Windows before adding more product complexity.

**Architecture:** Keep the current Electron + React + SQLite structure, but focus only on operational stability: dev startup reliability, preload/runtime consistency, rebuild/repackage recovery, and finer task progress updates. Avoid feature expansion during this phase — every change should improve observability, repeatability, or recovery.

**Tech Stack:** Electron, React, TypeScript, Vite, SQLite (better-sqlite3), FFmpeg, PowerShell, ESLint, Vitest

---

## File Structure

### Runtime and startup stability
- Modify: `E:/codex/新建文件夹/electron/main.ts` — tighten dev vs packaged renderer loading, runtime diagnostics, and startup fallback behavior
- Modify: `E:/codex/新建文件夹/electron/preload.cjs` — keep renderer bridge consistent with runtime expectations
- Modify: `E:/codex/新建文件夹/package.json` — stabilize dev/build/dist scripts and recovery scripts
- Modify: `E:/codex/新建文件夹/run_electron_debug.ps1` — keep debug launch path reliable on Windows

### Packaging and recovery
- Modify: `E:/codex/新建文件夹/package.json` — refine `dist` and `dist:fresh`
- Create: `E:/codex/新建文件夹\clean_release_lock.ps1` — deterministic process and file-lock cleanup before repackaging
- Modify: `E:/codex/新建文件夹\DELIVERY_STATUS.md` — reflect packaging recovery and runtime verification workflow

### Task progress quality
- Modify: `E:/codex/新建文件夹/electron/services/task-service.ts` — improve task update ergonomics and make progress transitions easier to call correctly
- Modify: `E:/codex/新建文件夹/electron/main.ts` — add finer-grained import/generation/export task step updates
- Modify: `E:/codex/新建文件夹/src/components/task-list.tsx` — show clearer progress detail
- Modify: `E:/codex/新建文件夹/src/pages/tasks-page.tsx` — show more useful task summary and status context

### Verification support
- Create: `E:/codex/新建文件夹/src/tests/task-progress.test.ts`
- Create: `E:/codex/新建文件夹/src/tests/runtime-paths.test.ts`

---

### Task 1: Stabilize Electron startup path selection

**Files:**
- Modify: `E:/codex/新建文件夹/electron/main.ts`
- Test: `E:/codex/新建文件夹/src/tests/runtime-paths.test.ts`

- [ ] **Step 1: Write the failing runtime path test**

```ts
import { describe, expect, it } from 'vitest'
import { resolveRendererTarget } from '../../electron/main'

describe('runtime path selection', () => {
  it('uses packaged file path when packaged mode is true', () => {
    const target = resolveRendererTarget({
      isPackaged: true,
      processResourcesPath: 'C:/app/resources',
      devServerUrl: 'http://127.0.0.1:5179',
    })

    expect(target.mode).toBe('file')
    expect(target.value).toContain('app.asar')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix "E:/codex/新建文件夹" test -- src/tests/runtime-paths.test.ts`
Expected: FAIL with missing `resolveRendererTarget`

- [ ] **Step 3: Extract startup path selection into a pure helper**

```ts
export function resolveRendererTarget(input: {
  isPackaged: boolean
  processResourcesPath: string
  devServerUrl: string
}) {
  if (input.isPackaged) {
    return {
      mode: 'file' as const,
      value: path.join(input.processResourcesPath, 'app.asar', 'dist', 'index.html'),
    }
  }

  return {
    mode: 'url' as const,
    value: input.devServerUrl,
  }
}
```

- [ ] **Step 4: Use the helper inside `createWindow()` and keep logs explicit**

```ts
const rendererTarget = resolveRendererTarget({
  isPackaged: app.isPackaged,
  processResourcesPath: process.resourcesPath,
  devServerUrl,
})

if (rendererTarget.mode === 'file') {
  console.log('[electron] loading packaged renderer', rendererTarget.value)
  void win.loadFile(rendererTarget.value)
} else {
  console.log('[electron] loading renderer', rendererTarget.value)
  void win.loadURL(rendererTarget.value)
}
```

- [ ] **Step 5: Re-run the focused test and main quality gates**

Run: `npm --prefix "E:/codex/新建文件夹" test -- src/tests/runtime-paths.test.ts && npm --prefix "E:/codex/新建文件夹" run build:electron && npm --prefix "E:/codex/新建文件夹" run build`
Expected: PASS

---

### Task 2: Make dev Electron startup reproducible

**Files:**
- Modify: `E:/codex/新建文件夹/package.json`
- Modify: `E:/codex/新建文件夹/run_electron_debug.ps1`

- [ ] **Step 1: Replace script assumptions with a deterministic dev sequence**

```json
{
  "scripts": {
    "dev": "concurrently -k \"npm:dev:renderer\" \"npm:dev:electron\"",
    "dev:renderer": "vite --host 127.0.0.1 --port 5179 --strictPort",
    "dev:electron": "wait-on http://127.0.0.1:5179 && npm run build:electron && electron .",
    "dev:electron:debug": "wait-on http://127.0.0.1:5179 && npm run build:electron && powershell -ExecutionPolicy Bypass -File ./run_electron_debug.ps1"
  }
}
```

- [ ] **Step 2: Ensure the debug script always runs from project root**

```powershell
$env:ELECTRON_ENABLE_LOGGING='1'
$env:ELECTRON_ENABLE_STACK_DUMPING='1'
Set-Location $PSScriptRoot
npx electron .
```

- [ ] **Step 3: Run the debug script path directly**

Run: `npm --prefix "E:/codex/新建文件夹" run dev:electron:debug`
Expected: Electron debug path launches without PowerShell parsing errors

---

### Task 3: Add explicit release-lock cleanup path

**Files:**
- Create: `E:/codex/新建文件夹/clean_release_lock.ps1`
- Modify: `E:/codex/新建文件夹/package.json`
- Modify: `E:/codex/新建文件夹/DELIVERY_STATUS.md`

- [ ] **Step 1: Add a cleanup script for release-lock recovery**

```powershell
Get-Process | Where-Object {
  $_.ProcessName -like 'electron*' -or $_.Path -like '*素材分类剪辑软件.exe'
} | ForEach-Object {
  Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 2
```

- [ ] **Step 2: Add a packaging helper script entry**

```json
{
  "scripts": {
    "release:unlock": "powershell -ExecutionPolicy Bypass -File ./clean_release_lock.ps1",
    "dist:fresh": "npm run release:unlock && powershell -Command \"if (Test-Path 'release\\win-unpacked') { Remove-Item 'release\\win-unpacked' -Recurse -Force }\" && npm run dist"
  }
}
```

- [ ] **Step 3: Document the recovery path in `DELIVERY_STATUS.md`**

```md
## 打包恢复建议
- 若 `release/win-unpacked` 被占用，先执行 `npm run release:unlock`
- 再执行 `npm run dist:fresh`
```

- [ ] **Step 4: Run the helper script itself**

Run: `npm --prefix "E:/codex/新建文件夹" run release:unlock`
Expected: exits successfully even when no matching process exists

---

### Task 4: Refine task progress reporting for import, generation, and export

**Files:**
- Modify: `E:/codex/新建文件夹/electron/services/task-service.ts`
- Modify: `E:/codex/新建文件夹/electron/main.ts`
- Test: `E:/codex/新建文件夹/src/tests/task-progress.test.ts`

- [ ] **Step 1: Write the failing task progress test**

```ts
import { describe, expect, it } from 'vitest'
import { createTaskService } from '../../electron/services/task-service'

describe('task progress', () => {
  it('updates a task from queued to done with latest step detail', () => {
    const service = createTaskService()
    const task = service.createTask({ type: 'generation', label: '生成' })
    service.updateTask(task.id, { status: 'running', progress: 50, currentStep: '候选排序' })
    service.updateTask(task.id, { status: 'done', progress: 100, currentStep: '生成完成' })
    const updated = service.listTasks().find(item => item.id === task.id)
    expect(updated?.status).toBe('done')
    expect(updated?.currentStep).toBe('生成完成')
  })
})
```

- [ ] **Step 2: Run test to verify behavior (or catch current gap)**

Run: `npm --prefix "E:/codex/新建文件夹" test -- src/tests/task-progress.test.ts`
Expected: FAIL if update behavior is incomplete or no test exists yet

- [ ] **Step 3: Centralize a small helper for step updates in `main.ts`**

```ts
function updateTaskStep(taskId: string, input: {
  progress: number
  currentStep: string
  currentFile?: string | null
  status?: 'running' | 'done' | 'failed'
  errorMessage?: string | null
}) {
  taskService.updateTask(taskId, {
    status: input.status ?? 'running',
    progress: input.progress,
    currentStep: input.currentStep,
    currentFile: input.currentFile ?? null,
    errorMessage: input.errorMessage ?? null,
  })
}
```

- [ ] **Step 4: Use that helper for import/generation/export transitions**

```ts
updateTaskStep(task.id, { progress: 10, currentStep: '扫描输入路径', currentFile: paths[0] ?? null })
updateTaskStep(task.id, { progress: 55, currentStep: '写入素材库', currentFile: imported[0]?.fileName ?? null })
updateTaskStep(task.id, { progress: 100, currentStep: `导入完成，共 ${imported.length} 条`, status: 'done' })
```

- [ ] **Step 5: Run the focused test and full quality gates**

Run: `npm --prefix "E:/codex/新建文件夹" test -- src/tests/task-progress.test.ts && npm --prefix "E:/codex/新建文件夹" run lint && npm --prefix "E:/codex/新建文件夹" run build:electron && npm --prefix "E:/codex/新建文件夹" run build`
Expected: PASS

---

### Task 5: Make task UI clearer and more actionable

**Files:**
- Modify: `E:/codex/新建文件夹/src/components/task-list.tsx`
- Modify: `E:/codex/新建文件夹/src/pages/tasks-page.tsx`

- [ ] **Step 1: Add task detail density without new abstraction**

```tsx
<div className="segment-head">
  <strong>{task.label}</strong>
  <span className={`task-status-badge ${task.status}`}>{statusLabel(task.status)}</span>
</div>
<p>{task.currentStep}</p>
<span>{task.currentFile ?? '未处理到具体文件'}</span>
<span>预计剩余：{task.etaSeconds ?? '未知'} 秒</span>
{task.errorMessage ? <span>错误：{task.errorMessage}</span> : null}
```

- [ ] **Step 2: Add summary counters in task page**

```tsx
<div className="tag-row">
  <span>进行中 {summary.running}</span>
  <span>已完成 {summary.done}</span>
  <span>失败 {summary.failed}</span>
</div>
```

- [ ] **Step 3: Run build to verify UI changes compile**

Run: `npm --prefix "E:/codex/新建文件夹" run build`
Expected: PASS

---

### Task 6: Keep source tree clean after Electron builds

**Files:**
- Modify: `E:/codex/新建文件夹/package.json`
- Modify: `E:/codex/新建文件夹/tsconfig.node.json`

- [ ] **Step 1: Force Electron build output to clean `dist-electron` before compiling**

```json
{
  "scripts": {
    "build:electron": "powershell -Command \"if (Test-Path 'dist-electron') { Remove-Item 'dist-electron' -Recurse -Force }\" && tsc -p tsconfig.node.json"
  }
}
```

- [ ] **Step 2: Keep `outDir` inside `dist-electron` in node tsconfig**

```json
{
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "dist-electron"
  }
}
```

- [ ] **Step 3: Run build:electron and verify source tree is clean**

Run: `npm --prefix "E:/codex/新建文件夹" run build:electron && powershell -Command "Get-ChildItem -LiteralPath 'E:/codex/新建文件夹/electron' -Filter '*.js' -Recurse"`
Expected: no generated `.js` build artifacts remain in the source `electron/` tree except intentional files like `preload.cjs`

---

## Self-Review

### Spec coverage
- Dev startup stability: covered by Tasks 1 and 2
- Repackaging recovery: covered by Task 3
- Task progress refinement: covered by Tasks 4 and 5
- Build artifact isolation: covered by Task 6

### Placeholder scan
- No TODO/TBD language remains
- Every task contains explicit files, commands, and code snippets
- No task refers vaguely to “add handling later” or “same as above”

### Type consistency
- Runtime helper names remain consistent: `resolveRendererTarget`, `updateTaskStep`, `createTaskService`
- Renderer API names remain consistent: `listAssets`, `listTasks`, `pickImportPaths`, `createImportTask`, `generateFromScript`, `exportTimeline`, `captureWindow`
- Task objects still use the same `TaskRecord` shape across renderer and main process
