import { useMemo, useState } from 'react'
import { CopySuggestionPanel } from '../components/copy-suggestion-panel'
import { VersionPreview } from '../components/version-preview'
import type { AssetRecord } from '../shared/types/asset'
import type { TimelineClip } from '../shared/types/generation'

export function VersionPage({
  clips,
  assets = [],
  script,
  onReplaceClip,
  lastGenerationSummary,
  onExportComplete,
  finalVideoPath,
  finalVideoDetail,
}: {
  clips: TimelineClip[]
  assets?: AssetRecord[]
  script: string
  onReplaceClip?: (index: number, assetId: string) => void
  lastGenerationSummary?: string
  onExportComplete?: (outputPath: string | null, detail: string) => void
  finalVideoPath?: string
  finalVideoDetail?: string
}) {
  const [selectedClipIndex, setSelectedClipIndex] = useState(0)
  const [lastUpdatedClipIndex, setLastUpdatedClipIndex] = useState<number | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isLoadingCopySuggestions, setIsLoadingCopySuggestions] = useState(false)
  const [exportDetail, setExportDetail] = useState('')
  const [lastReplacedAssetLabel, setLastReplacedAssetLabel] = useState('')
  const [copySuggestionDetail, setCopySuggestionDetail] = useState('请先在设置页完成专业版 API 配置。')
  const [copySuggestions, setCopySuggestions] = useState<string[]>([])
  const [copyActionDetail, setCopyActionDetail] = useState('')
  const selectedClip = clips[selectedClipIndex] ?? null
  const selectedAsset = assets.find(asset => asset.id === selectedClip?.assetId) ?? null
  const replacementOptions = useMemo(
    () => assets.filter(asset => asset.id !== selectedClip?.assetId),
    [assets, selectedClip],
  )

  async function handleExport() {
    if (!window.materialEditorApi?.exportTimeline) {
      setExportDetail('当前环境暂不可导出视频，请先检查本地导出配置。')
      return
    }

    setIsExporting(true)
    try {
      const result = await window.materialEditorApi.exportTimeline(clips)
      setExportDetail(result.detail)
      onExportComplete?.(result.outputPath, result.detail)
    } finally {
      setIsExporting(false)
    }
  }

  async function handleLoadCopySuggestions() {
    if (!window.materialEditorApi?.getCopySuggestions) {
      return
    }

    setIsLoadingCopySuggestions(true)
    try {
      const result = await window.materialEditorApi.getCopySuggestions({ script })
      setCopySuggestionDetail(result.detail)
      setCopySuggestions(result.suggestions)
      setCopyActionDetail('')
    } finally {
      setIsLoadingCopySuggestions(false)
    }
  }

  async function handleCopySuggestions() {
    if (!copySuggestions.length) {
      setCopyActionDetail('当前还没有可复制的文案建议。')
      return
    }

    try {
      await navigator.clipboard.writeText(copySuggestions.join('\n'))
      setCopyActionDetail('已复制到剪贴板。')
    } catch {
      setCopyActionDetail('复制失败，请手动复制。')
    }
  }

  function handleReplace(index: number, asset: AssetRecord) {
    onReplaceClip?.(index, asset.id)
    setSelectedClipIndex(index)
    setLastUpdatedClipIndex(index)
    setLastReplacedAssetLabel(`第 ${index + 1} 段已更新为 ${asset.fileName}`)
  }

  return (
    <section className="panel panel-column">
      <header className="panel-header">
        <div>
          <span className="eyebrow">基础版调整</span>
          <h2>版本调整</h2>
        </div>
        <button onClick={handleExport} disabled={!clips.length || isExporting}>
          {isExporting ? '导出中...' : '导出视频'}
        </button>
      </header>
      {clips.length ? (
        <>
          <VersionPreview clips={clips} assets={assets} selectedClipIndex={selectedClipIndex} />
          <div className="tag-row">
            {clips.map((clip, index) => (
              <button
                key={`${clip.segmentId}-${index}`}
                onClick={() => setSelectedClipIndex(index)}
                className={lastUpdatedClipIndex === index ? 'active-preview-button' : ''}
              >
                片段 {index + 1}
              </button>
            ))}
          </div>
          <div className="panel secondary-panel panel-column">
            <h3>当前片段</h3>
            <p>当前片段：第 {selectedClipIndex + 1} 段</p>
            <p>当前素材：{selectedAsset?.fileName ?? '未知素材'}</p>
            <p>素材状态：{selectedAsset ? '已匹配' : '未匹配'}</p>
            <p>素材位置：{selectedAsset?.sourcePath ?? '未知路径'}</p>
            <p>片段时长：{selectedClip ? Math.round((selectedClip.timelineEndMs - selectedClip.timelineStartMs) / 1000) : 0} 秒</p>
            {lastUpdatedClipIndex === selectedClipIndex ? <p>该片段已更新，可直接继续导出视频。</p> : null}
            <div className="tag-row">
              {replacementOptions.slice(0, 3).map(asset => (
                <button key={asset.id} onClick={() => handleReplace(selectedClipIndex, asset)}>
                  使用 {asset.fileName}
                </button>
              ))}
            </div>
            <p>{lastReplacedAssetLabel || '如果当前片段不合适，可以从下面快速替换素材。'}</p>
            <p>{lastGenerationSummary || '已生成基础版本，可继续替换片段后导出视频。'}</p>
            <p>{exportDetail || '导出完成后，这里会显示视频输出结果。'}</p>
            <div className="panel secondary-panel panel-column">
              <CopySuggestionPanel
                detail={copySuggestionDetail}
                suggestions={copySuggestions}
                actionDetail={copyActionDetail}
                isLoading={isLoadingCopySuggestions}
                onLoadSuggestions={handleLoadCopySuggestions}
                onCopySuggestions={handleCopySuggestions}
              />
            </div>
            <div className="panel secondary-panel">
              <h3>导出结果</h3>
              <p>输出视频：{finalVideoPath || '待导出'}</p>
              <p>{finalVideoDetail || '导出完成后，这里会显示输出结果和文件位置。'}</p>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">当前还没有可调整的基础版本，请先在生成页完成粗剪生成。</div>
      )}
    </section>
  )
}
