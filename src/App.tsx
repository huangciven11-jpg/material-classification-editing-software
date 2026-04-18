import { useEffect, useMemo, useState } from 'react'
import { MaterialDetailPanel } from './components/material-detail-panel'
import { NavigationShell } from './components/navigation-shell'
import { LibraryPage } from './pages/library-page'
import { GeneratePage } from './pages/generate-page'
import { VersionPage } from './pages/version-page'
import { TasksPage } from './pages/tasks-page'
import { SettingsPage } from './pages/settings-page'
import type { AssetRecord } from './shared/types/asset'
import type { GenerationResult, TimelineClip } from './shared/types/generation'
import type { TaskRecord } from './shared/types/task'

const fallbackAssets: AssetRecord[] = [
  {
    id: '1',
    fileName: '沙发-宠物毛-特写.mp4',
    sourcePath: 'D:/assets/沙发-宠物毛-特写.mp4',
    durationMs: 2200,
    thumbnailPath: null,
    width: null,
    height: null,
    category: 'problem',
    categoryReason: '默认问题展示示例素材。',
    categoryConfidence: 'medium',
    contentTags: ['宠物毛'],
    visualTags: ['特写'],
    styleTags: ['暖光'],
    usageTags: ['问题展示'],
    similarGroupId: 'g-1',
    qualityScore: 0.83,
    status: 'active',
  },
  {
    id: '2',
    fileName: '沙发-一刷干净-结果.mp4',
    sourcePath: 'D:/assets/沙发-一刷干净-结果.mp4',
    durationMs: 2400,
    thumbnailPath: null,
    width: null,
    height: null,
    category: 'result',
    categoryReason: '命中结果类关键词。',
    categoryConfidence: 'high',
    contentTags: ['清洁结果'],
    visualTags: ['中景'],
    styleTags: ['明亮'],
    usageTags: ['结果展示'],
    similarGroupId: 'g-2',
    qualityScore: 0.91,
    status: 'favorite',
  },
]

const fallbackTasks: TaskRecord[] = [
  {
    id: 'task-1',
    type: 'asset-import',
    label: '素材增量分析',
    status: 'running',
    progress: 62,
    currentStep: '生成标签与相似组',
    currentFile: '沙发-宠物毛-特写.mp4',
    etaSeconds: 45,
    errorMessage: null,
  },
]

const fallbackTimeline: TimelineClip[] = [
  {
    segmentId: 'segment-1',
    assetId: '1',
    timelineStartMs: 0,
    timelineEndMs: 2200,
  },
  {
    segmentId: 'segment-2',
    assetId: '2',
    timelineStartMs: 2200,
    timelineEndMs: 4600,
  },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<'library' | 'generate' | 'version' | 'tasks' | 'settings'>('library')
  const [script, setScript] = useState('沙发上全是宠物毛。轻轻一刷就干净。')
  const [assets, setAssets] = useState<AssetRecord[]>(fallbackAssets)
  const [tasks, setTasks] = useState<TaskRecord[]>(fallbackTasks)
  const [timeline, setTimeline] = useState<TimelineClip[]>(fallbackTimeline)
  const [lastImportSummary, setLastImportSummary] = useState('')
  const [lastGenerationSummary, setLastGenerationSummary] = useState('')
  const [finalVideoPath, setFinalVideoPath] = useState('')
  const [finalVideoDetail, setFinalVideoDetail] = useState('')
  const selectedAsset = useMemo(() => assets[0] ?? null, [assets])

  async function refreshLibraryAndTasks() {
    if (!window.materialEditorApi) {
      return fallbackAssets
    }

    try {
      const [nextAssets, nextTasks] = await Promise.all([
        window.materialEditorApi.listAssets?.() ?? Promise.resolve(fallbackAssets),
        window.materialEditorApi.listTasks?.() ?? Promise.resolve(fallbackTasks),
      ])
      if (nextAssets?.length) setAssets(nextAssets)
      if (nextTasks?.length) setTasks(nextTasks)
      return nextAssets
    } catch {
      return fallbackAssets
    }
  }

  useEffect(() => {
    void refreshLibraryAndTasks()
    const timer = window.setInterval(() => {
      void refreshLibraryAndTasks()
    }, 1500)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  function handleGenerationComplete(result: GenerationResult) {
    setTimeline(result.timeline)
    setLastGenerationSummary(`已生成基础版本，共 ${result.timeline.length} 段，可前往版本页继续调整。`)
    setFinalVideoPath('待导出视频')
    setFinalVideoDetail('当前基础版本已更新，可以进入版本页确认并导出。')
    setActiveTab('version')
  }

  function handleReplaceClip(index: number, assetId: string) {
    const selectedAsset = assets.find(asset => asset.id === assetId)
    setTimeline(previous => previous.map((clip, clipIndex) => clipIndex === index ? { ...clip, assetId } : clip))
    if (selectedAsset) {
      setLastGenerationSummary(`第 ${index + 1} 段已更新为 ${selectedAsset.fileName}，可继续导出视频。`)
      setFinalVideoDetail('片段已替换，建议重新导出视频。')
    }
  }

  async function handleImportComplete(pickedPathsCount: number) {
    const nextAssets = await refreshLibraryAndTasks()
    const problem = nextAssets.filter(asset => asset.category === 'problem').length
    const demo = nextAssets.filter(asset => asset.category === 'demo').length
    const detail = nextAssets.filter(asset => asset.category === 'detail').length
    const result = nextAssets.filter(asset => asset.category === 'result').length
    const highConfidence = nextAssets.filter(asset => asset.categoryConfidence === 'high').length
    setLastImportSummary(`本次导入 ${pickedPathsCount} 个路径；当前素材库共 ${nextAssets.length} 条，其中问题 ${problem}、过程 ${demo}、细节 ${detail}、结果 ${result}、高置信度 ${highConfidence} 条。`)
  }

  function handleExportComplete(outputPath: string | null, detail: string) {
    setFinalVideoPath(outputPath ?? '未导出视频')
    setFinalVideoDetail(detail)
  }

  return (
    <main className="app-shell">
      <NavigationShell activeTab={activeTab} onChange={setActiveTab} />

      <section className="workspace">
        {activeTab === 'library' ? <LibraryPage assets={assets} onImportComplete={handleImportComplete} lastImportSummary={lastImportSummary} /> : null}
        {activeTab === 'generate' ? <GeneratePage script={script} assets={assets} onScriptChange={setScript} onGenerationComplete={handleGenerationComplete} onAssetsChanged={refreshLibraryAndTasks} /> : null}
        {activeTab === 'version' ? <VersionPage clips={timeline} assets={assets} script={script} onReplaceClip={handleReplaceClip} lastGenerationSummary={lastGenerationSummary} onExportComplete={handleExportComplete} finalVideoPath={finalVideoPath} finalVideoDetail={finalVideoDetail} /> : null}
        {activeTab === 'tasks' ? <TasksPage tasks={tasks} /> : null}
        {activeTab === 'settings' ? <SettingsPage /> : null}
      </section>

      <aside className="detail-panel">
        <div className="panel sticky-panel">
          <span className="eyebrow">详情 / 操作区</span>
          {activeTab === 'library' ? <MaterialDetailPanel asset={selectedAsset} /> : null}
          {activeTab === 'generate' ? (
            <>
              <h3>生成说明</h3>
              <p>基础版会先生成 1 个可调整的版本，生成完成后可前往版本页替换片段并导出视频。</p>
            </>
          ) : null}
          {activeTab === 'tasks' ? (
            <>
              <h3>任务详情</h3>
              <p>这里展示当前步骤、当前文件、错误信息与重试入口。</p>
            </>
          ) : null}
          {activeTab === 'version' ? (
            <>
              <h3>导出结果</h3>
              <p>输出视频：{finalVideoPath || '待导出视频'}</p>
              <p>{finalVideoDetail || '生成和导出后，这里会显示视频输出结果。'}</p>
            </>
          ) : null}
          {activeTab === 'settings' ? (
            <>
              <h3>配置说明</h3>
              <p>这里展示当前配置的说明、预览和影响范围。</p>
            </>
          ) : null}
        </div>
      </aside>
    </main>
  )
}
