import electron from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createAssetIngestService } from './services/asset-ingest-service.js'
import { createAssetLibraryService } from './services/asset-library-service.js'
import { splitScriptIntoSegments } from './services/script-service.js'
import { rankCandidatesForSegment } from './services/candidate-service.js'
import { buildTimeline } from './services/timeline-service.js'
import { createTaskService } from './services/task-service.js'
import { exportTimelineToMp4 } from './services/export-service.js'
import { fetchAssetTagEnhancementSuggestions } from './services/asset-tag-enhancement-service.js'
import { captureDesktopScreenshot } from './services/desktop-capture-service.js'
import { fetchCopySuggestions } from './services/copy-suggestion-service.js'
import type { TimelineClip } from '../src/shared/types/generation.js'

const { app, BrowserWindow, ipcMain, dialog } = electron

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const devServerUrl = 'http://127.0.0.1:5179'
const defaultApiConfig = {
  provider: 'OpenAI Compatible',
  baseUrl: 'https://api.example.com/v1',
  model: 'gpt-4o-mini',
  apiKey: '',
  updatedAt: '',
}

type StoredApiConfig = typeof defaultApiConfig

type PublicApiConfig = {
  provider: string
  baseUrl: string
  model: string
  hasApiKey: boolean
  apiKeyMasked: string
  updatedAt: string
  detail?: string
}

function getApiSettingsFilePath() {
  return path.join(app.getPath('userData'), 'api-settings.json')
}

function maskApiKey(apiKey: string) {
  if (!apiKey) {
    return ''
  }

  if (apiKey.length < 8) {
    return '已配置'
  }

  return `${apiKey.slice(0, 4)}****${apiKey.slice(-4)}`
}

function toPublicApiConfig(config: StoredApiConfig, detail?: string): PublicApiConfig {
  return {
    provider: config.provider,
    baseUrl: config.baseUrl,
    model: config.model,
    hasApiKey: Boolean(config.apiKey),
    apiKeyMasked: maskApiKey(config.apiKey),
    updatedAt: config.updatedAt,
    detail,
  }
}

function readStoredApiConfig() {
  const filePath = getApiSettingsFilePath()

  if (!fs.existsSync(filePath)) {
    return {
      config: { ...defaultApiConfig },
      detail: '当前尚未保存专业版 API 配置。',
    }
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const parsed = JSON.parse(content) as Partial<StoredApiConfig>
    return {
      config: {
        provider: parsed.provider || defaultApiConfig.provider,
        baseUrl: parsed.baseUrl || defaultApiConfig.baseUrl,
        model: parsed.model || defaultApiConfig.model,
        apiKey: parsed.apiKey || '',
        updatedAt: parsed.updatedAt || '',
      },
      detail: '已读取本地专业版 API 配置。',
    }
  } catch {
    return {
      config: { ...defaultApiConfig },
      detail: '本地 API 配置读取失败，已回退为默认状态。',
    }
  }
}

function saveStoredApiConfig(input: {
  provider: string
  baseUrl: string
  model: string
  apiKey: string
}) {
  const previous = readStoredApiConfig().config
  const nextConfig: StoredApiConfig = {
    provider: input.provider,
    baseUrl: input.baseUrl,
    model: input.model,
    apiKey: input.apiKey || previous.apiKey,
    updatedAt: new Date().toISOString(),
  }

  const filePath = getApiSettingsFilePath()
  fs.writeFileSync(filePath, JSON.stringify(nextConfig, null, 2), 'utf8')
  return nextConfig
}

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

function bootstrapServices() {
  const assetLibrary = createAssetLibraryService()
  const assetIngest = createAssetIngestService()
  const taskService = createTaskService()
  assetLibrary.seedDemoAssets()
  if (taskService.listTasks().length === 0) {
    taskService.createTask({ type: 'asset-import', label: '素材增量分析', currentStep: '生成标签与相似组' })
  }
  return { assetLibrary, assetIngest, taskService }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 960,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  const rendererTarget = resolveRendererTarget({
    isPackaged: app.isPackaged,
    processResourcesPath: process.resourcesPath,
    devServerUrl,
  })

  if (rendererTarget.mode === 'file') {
    console.log('[electron] loading packaged renderer', rendererTarget.value)
    if (fs.existsSync(rendererTarget.value)) {
      void win.loadFile(rendererTarget.value)
      return
    }
    console.error('[electron] packaged renderer missing', rendererTarget.value)
  }

  console.log('[electron] loading renderer', rendererTarget.value)
  void win.loadURL(rendererTarget.value)
}

function registerIpcHandlers() {
  const { assetLibrary, assetIngest, taskService } = bootstrapServices()

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

  ipcMain.handle('assets:list', async () => assetLibrary.listAssets())
  ipcMain.handle('tasks:list', async () => taskService.listTasks())
  ipcMain.handle('settings:get-api-config', async () => {
    const { config, detail } = readStoredApiConfig()
    return toPublicApiConfig(config, detail)
  })
  ipcMain.handle('settings:save-api-config', async (_event, input: {
    provider: string
    baseUrl: string
    model: string
    apiKey: string
  }) => {
    try {
      const config = saveStoredApiConfig(input)
      return toPublicApiConfig(config, 'API 配置已保存到本地用户目录。')
    } catch {
      const { config } = readStoredApiConfig()
      return toPublicApiConfig(config, 'API 配置保存失败，请检查本地目录权限。')
    }
  })
  ipcMain.handle('assets:apply-tag-suggestions', async (_event, input: {
    assetId: string
    suggestedTags: string[]
  }) => assetLibrary.applySuggestedTags(input.assetId, input.suggestedTags))
  ipcMain.handle('assets:pick-import-paths', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory', 'multiSelections'],
      filters: [{ name: 'Video', extensions: ['mp4', 'mov', 'mkv', 'avi'] }],
    })
    return result.canceled ? [] : result.filePaths
  })
  ipcMain.handle('assets:import', async (_event, paths: string[]) => {
    const task = taskService.createTask({
      type: 'asset-import',
      label: `导入 ${paths.length} 个素材`,
      currentStep: '扫描输入路径',
    })
    updateTaskStep(task.id, { progress: 10, currentStep: '扫描输入路径', currentFile: paths[0] ?? null })
    const imported = assetIngest.importPaths(paths)
    updateTaskStep(task.id, { progress: 55, currentStep: '写入素材库', currentFile: imported[0]?.fileName ?? null })
    updateTaskStep(task.id, { progress: 100, currentStep: `导入完成，共 ${imported.length} 条`, status: 'done' })
    return task.id
  })
  ipcMain.handle('generation:create', async (_event, script: string) => {
    const task = taskService.createTask({
      type: 'generation',
      label: '生成基础版本',
      currentStep: '拆分脚本',
    })
    updateTaskStep(task.id, { progress: 20, currentStep: '拆分脚本' })
    const assets = assetLibrary.listAssets()
    const segments = splitScriptIntoSegments(script)
    updateTaskStep(task.id, { progress: 55, currentStep: '候选排序', currentFile: segments[0]?.text ?? null })
    const ranked = Object.fromEntries(segments.map(segment => [segment.id, rankCandidatesForSegment(segment, assets)]))
    const timeline = buildTimeline(segments, ranked)
    updateTaskStep(task.id, { progress: 80, currentStep: '生成基础版本', currentFile: `共 ${timeline.length} 段` })
    updateTaskStep(task.id, { progress: 100, currentStep: '基础版本生成完成', status: 'done' })
    return {
      segments,
      timeline,
      candidates: ranked,
    }
  })
  ipcMain.handle('generation:export', async (_event, timeline: TimelineClip[]) => {
    const task = taskService.createTask({
      type: 'export',
      label: '导出视频',
      currentStep: '准备导出清单',
    })
    updateTaskStep(task.id, { progress: 25, currentStep: '准备导出清单' })
    updateTaskStep(task.id, { progress: 70, currentStep: '调用 FFmpeg 导出视频', currentFile: `共 ${timeline.length} 段` })
    const result = exportTimelineToMp4(timeline, assetLibrary.listAssets())
    updateTaskStep(task.id, {
      progress: result.outputPath ? 100 : 90,
      currentStep: result.outputPath ? '视频导出完成' : '视频导出失败',
      currentFile: result.outputPath,
      errorMessage: result.outputPath ? null : result.detail,
      status: result.outputPath ? 'done' : 'failed',
    })
    return result
  })
  ipcMain.handle('enhance:asset-tags', async (_event, input: {
    script: string
    assets: Array<{
      id: string
      fileName: string
      category: string
      contentTags: string[]
      visualTags: string[]
      usageTags: string[]
    }>
  }) => {
    const { config } = readStoredApiConfig()
    const configured = Boolean(config.apiKey && config.baseUrl)

    if (!configured) {
      return {
        enabled: false,
        detail: '请先在设置页完成专业版 API 配置。',
        suggestions: [],
      }
    }

    if (!input.script.trim()) {
      return {
        enabled: false,
        detail: '请先输入脚本，再获取标签增强建议。',
        suggestions: [],
      }
    }

    if (!input.assets.length) {
      return {
        enabled: false,
        detail: '当前没有可分析的素材。',
        suggestions: [],
      }
    }

    try {
      const suggestions = await fetchAssetTagEnhancementSuggestions({
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
        model: config.model,
        payload: input,
      })

      return {
        enabled: true,
        detail: `已生成 ${suggestions.length} 条标签增强建议。`,
        suggestions: suggestions.map(item => ({
          assetId: item.assetId,
          fileName: input.assets.find(asset => asset.id === item.assetId)?.fileName || item.assetId,
          suggestedTags: item.suggestedTags,
          reason: item.reason,
        })),
      }
    } catch {
      return {
        enabled: true,
        detail: '获取失败，请检查 API 配置或网络状态。',
        suggestions: [],
      }
    }
  })
  ipcMain.handle('enhance:copy-suggestions', async (_event, input: { script: string }) => {
    const { config } = readStoredApiConfig()
    const configured = Boolean(config.apiKey && config.baseUrl)

    if (!configured) {
      return {
        enabled: false,
        detail: '请先在设置页完成专业版 API 配置。',
        suggestions: [],
      }
    }

    if (!input.script.trim()) {
      return {
        enabled: false,
        detail: '请先输入脚本，再获取文案建议。',
        suggestions: [],
      }
    }

    try {
      const suggestions = await fetchCopySuggestions({
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
        model: config.model,
        script: input.script,
      })
      return {
        enabled: true,
        detail: `已生成 ${suggestions.length} 条文案建议。`,
        suggestions,
      }
    } catch {
      return {
        enabled: true,
        detail: '获取失败，请检查 API 配置或网络状态。',
        suggestions: [],
      }
    }
  })
  ipcMain.handle('window:capture', async () => captureDesktopScreenshot())
}

if (process.env.VITEST !== 'true') {
  app.on('web-contents-created', (_event, contents) => {
    contents.on('did-finish-load', () => {
      console.log('[electron] renderer finished load')
    })
    contents.on('did-fail-load', (_loadEvent, code, description) => {
      console.error('[electron] renderer load failed', code, description)
    })
  })

  app.whenReady().then(() => {
    console.log('[electron] app ready')
    registerIpcHandlers()
    createWindow()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
