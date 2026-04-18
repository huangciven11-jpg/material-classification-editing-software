import electron from 'electron'
import type { TimelineClip } from '../src/shared/types/generation.js'

const { contextBridge, ipcRenderer } = electron

contextBridge.exposeInMainWorld('materialEditorApi', {
  listAssets: () => ipcRenderer.invoke('assets:list'),
  listTasks: () => ipcRenderer.invoke('tasks:list'),
  pickImportPaths: () => ipcRenderer.invoke('assets:pick-import-paths'),
  createImportTask: (paths: string[]) => ipcRenderer.invoke('assets:import', paths),
  applyTagSuggestions: (input: { assetId: string; suggestedTags: string[] }) => ipcRenderer.invoke('assets:apply-tag-suggestions', input),
  generateFromScript: (script: string) => ipcRenderer.invoke('generation:create', script),
  exportTimeline: (timeline: TimelineClip[]) => ipcRenderer.invoke('generation:export', timeline),
  getApiConfig: () => ipcRenderer.invoke('settings:get-api-config'),
  saveApiConfig: (input: { provider: string; baseUrl: string; model: string; apiKey: string }) => ipcRenderer.invoke('settings:save-api-config', input),
  enhanceAssetTags: (input: {
    script: string
    assets: Array<{
      id: string
      fileName: string
      category: string
      contentTags: string[]
      visualTags: string[]
      usageTags: string[]
    }>
  }) => ipcRenderer.invoke('enhance:asset-tags', input),
  getCopySuggestions: (input: { script: string }) => ipcRenderer.invoke('enhance:copy-suggestions', input),
  captureWindow: () => ipcRenderer.invoke('window:capture'),
})
