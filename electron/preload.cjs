const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('materialEditorApi', {
  listAssets: () => ipcRenderer.invoke('assets:list'),
  listTasks: () => ipcRenderer.invoke('tasks:list'),
  pickImportPaths: () => ipcRenderer.invoke('assets:pick-import-paths'),
  createImportTask: paths => ipcRenderer.invoke('assets:import', paths),
  applyTagSuggestions: input => ipcRenderer.invoke('assets:apply-tag-suggestions', input),
  generateFromScript: script => ipcRenderer.invoke('generation:create', script),
  exportTimeline: timeline => ipcRenderer.invoke('generation:export', timeline),
  getApiConfig: () => ipcRenderer.invoke('settings:get-api-config'),
  saveApiConfig: input => ipcRenderer.invoke('settings:save-api-config', input),
  enhanceAssetTags: input => ipcRenderer.invoke('enhance:asset-tags', input),
  getCopySuggestions: input => ipcRenderer.invoke('enhance:copy-suggestions', input),
  captureWindow: () => ipcRenderer.invoke('window:capture'),
})
