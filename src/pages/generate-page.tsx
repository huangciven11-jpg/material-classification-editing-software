import { useEffect, useMemo, useState } from 'react'
import { CopySuggestionPanel } from '../components/copy-suggestion-panel'
import { ScriptSegmentList } from '../components/script-segment-list'
import { splitScriptIntoSegments } from '../../electron/services/script-service'
import type { AssetRecord } from '../shared/types/asset'
import type { CandidateAsset, GenerationResult, TimelineClip } from '../shared/types/generation'

export function GeneratePage({
  script,
  assets = [],
  onScriptChange,
  onGenerationComplete,
  onAssetsChanged,
  onTagsApplied,
}: {
  script: string
  assets?: AssetRecord[]
  onScriptChange: (value: string) => void
  onGenerationComplete?: (result: GenerationResult) => void
  onAssetsChanged?: () => Promise<unknown>
  onTagsApplied?: (assetId: string, addedTags: string[]) => void
}) {
  const [candidates, setCandidates] = useState<Record<string, CandidateAsset[]>>({})
  const [timeline, setTimeline] = useState<TimelineClip[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingCopySuggestions, setIsLoadingCopySuggestions] = useState(false)
  const [isLoadingTagEnhancements, setIsLoadingTagEnhancements] = useState(false)
  const [isApplyingAllTags, setIsApplyingAllTags] = useState(false)
  const [selectionSummary, setSelectionSummary] = useState('')
  const [enhancedTagDetail, setEnhancedTagDetail] = useState('专业版素材标签增强暂未接入，请先使用本地基础版分析。')
  const [tagEnhancementSuggestions, setTagEnhancementSuggestions] = useState<Array<{
    assetId: string
    fileName: string
    suggestedTags: string[]
    reason: string
  }>>([])
  const [tagApplyStatus, setTagApplyStatus] = useState<Record<string, string>>({})
  const [applyingAssetId, setApplyingAssetId] = useState('')
  const [copySuggestionDetail, setCopySuggestionDetail] = useState('专业版文案建议暂未接入，请先完成基础版本生成。')
  const [copySuggestions, setCopySuggestions] = useState<string[]>([])
  const [copyActionDetail, setCopyActionDetail] = useState('')
  const [enhancementConfigured, setEnhancementConfigured] = useState(false)
  const segments = useMemo(() => splitScriptIntoSegments(script), [script])

  useEffect(() => {
    let disposed = false

    async function loadEnhancementPreview() {
      if (!window.materialEditorApi?.getApiConfig) {
        return
      }

      try {
        const config = await window.materialEditorApi.getApiConfig()

        if (disposed) {
          return
        }

        setEnhancementConfigured(config.hasApiKey)
        setEnhancedTagDetail(config.hasApiKey ? '已配置专业版 API，可获取标签增强建议。' : '专业版素材标签增强暂未接入，请先在设置页完成 API 配置。')
      } catch {
        if (disposed) {
          return
        }

        setEnhancedTagDetail('当前无法获取专业版素材标签增强状态。')
        setEnhancementConfigured(false)
      }
    }

    void loadEnhancementPreview()

    return () => {
      disposed = true
    }
  }, [])

  async function handleGenerate() {
    if (!window.materialEditorApi?.generateFromScript) {
      return
    }

    setIsGenerating(true)
    try {
      const result = await window.materialEditorApi.generateFromScript(script)
      setCandidates(result.candidates)
      setTimeline(result.timeline)
      setSelectionSummary(`已生成 1 个基础版本，当前共 ${result.timeline.length} 段，可前往版本页继续调整并导出。`)
      onGenerationComplete?.(result)
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleLoadTagEnhancements() {
    if (!window.materialEditorApi?.enhanceAssetTags) {
      return
    }

    setIsLoadingTagEnhancements(true)
    try {
      const result = await window.materialEditorApi.enhanceAssetTags({
        script,
        assets: assets.map(asset => ({
          id: asset.id,
          fileName: asset.fileName,
          category: asset.category,
          contentTags: asset.contentTags,
          visualTags: asset.visualTags,
          usageTags: asset.usageTags,
        })),
      })
      setEnhancedTagDetail(result.detail)
      setTagEnhancementSuggestions(result.suggestions)
      setTagApplyStatus({})
      setEnhancementConfigured(result.enabled || enhancementConfigured)
    } finally {
      setIsLoadingTagEnhancements(false)
    }
  }

  async function handleApplySuggestedTags(assetId: string, suggestedTags: string[]) {
    if (!window.materialEditorApi?.applyTagSuggestions) {
      return false
    }

    setApplyingAssetId(assetId)
    try {
      const beforeAsset = assets.find(asset => asset.id === assetId)
      const existingTags = beforeAsset?.contentTags ?? []
      const addedTags = suggestedTags.filter(tag => tag.trim() && !existingTags.includes(tag))
      const result = await window.materialEditorApi.applyTagSuggestions({ assetId, suggestedTags })
      setTagApplyStatus(previous => ({
        ...previous,
        [assetId]: result.detail,
      }))
      if (result.success) {
        onTagsApplied?.(assetId, addedTags)
        await onAssetsChanged?.()
      }
      return result.success
    } finally {
      setApplyingAssetId('')
    }
  }

  async function handleApplyAllSuggestedTags() {
    if (!tagEnhancementSuggestions.length) {
      setEnhancedTagDetail('当前还没有可应用的标签增强建议。')
      return
    }

    setIsApplyingAllTags(true)
    let successCount = 0
    try {
      for (const item of tagEnhancementSuggestions) {
        const success = await handleApplySuggestedTags(item.assetId, item.suggestedTags)
        if (success) {
          successCount += 1
        }
      }
      setEnhancedTagDetail(`已批量应用 ${successCount} 条标签增强建议。`)
    } finally {
      setIsApplyingAllTags(false)
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
      setEnhancementConfigured(result.enabled || enhancementConfigured)
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
      setCopyActionDetail('文案建议已复制到剪贴板。')
    } catch {
      setCopyActionDetail('复制失败，请手动选择文案建议。')
    }
  }

  function handleSelectCandidate(segmentId: string, assetId: string) {
    setTimeline(previous => {
      const nextTimeline = previous.map(clip => clip.segmentId === segmentId ? { ...clip, assetId } : clip)
      setSelectionSummary('已更新当前版本中的片段选择，可前往版本页继续确认并导出。')
      onGenerationComplete?.({
        segments,
        timeline: nextTimeline,
        candidates,
      })
      return nextTimeline
    })
  }

  return (
    <section className="panel panel-column">
      <header className="panel-header">
        <div>
          <span className="eyebrow">基础版生成</span>
          <h2>粗剪生成</h2>
        </div>
        <button onClick={handleGenerate} disabled={isGenerating}>{isGenerating ? '生成中...' : '生成基础版本'}</button>
      </header>
      <textarea value={script} onChange={event => onScriptChange(event.target.value)} />
      <p>{selectionSummary || '输入脚本后生成 1 个基础版本，生成完成后可前往版本页替换片段并导出视频。'}</p>
      <div className="panel secondary-panel panel-column">
        <div className="status-row">
          <h3>专业版能力</h3>
          <span className={`task-status-badge ${enhancementConfigured ? 'done' : 'queued'}`}>
            {enhancementConfigured ? '已配置' : '未配置'}
          </span>
        </div>
        <p>{enhancementConfigured ? '已检测到专业版 API 配置，可继续接入真实增强能力。' : '当前尚未完成专业版 API 配置，增强能力仍处于占位状态。'}</p>
        <div className="suggestion-block">
          <div className="status-row">
            <h3>标签增强建议</h3>
            <div className="action-row">
              <button onClick={handleLoadTagEnhancements} disabled={isLoadingTagEnhancements}>{isLoadingTagEnhancements ? '获取中...' : '获取标签增强建议'}</button>
              <button onClick={handleApplyAllSuggestedTags} disabled={!tagEnhancementSuggestions.length || isApplyingAllTags}>
                {isApplyingAllTags ? '应用中...' : '一键全部应用'}
              </button>
            </div>
          </div>
          <p>{enhancedTagDetail}</p>
          {tagEnhancementSuggestions.length ? (
            <ul className="suggestion-list">
              {tagEnhancementSuggestions.map(item => (
                <li key={item.assetId}>
                  <div className="status-row">
                    <strong>{item.fileName}</strong>
                    <button onClick={() => handleApplySuggestedTags(item.assetId, item.suggestedTags)} disabled={applyingAssetId === item.assetId || isApplyingAllTags}>
                      {applyingAssetId === item.assetId ? '应用中...' : '应用标签'}
                    </button>
                  </div>
                  <div>{item.suggestedTags.join('、')}（{item.reason}）</div>
                  {tagApplyStatus[item.assetId] ? <p>{tagApplyStatus[item.assetId]}</p> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <CopySuggestionPanel
          detail={`文案建议：${copySuggestionDetail}`}
          suggestions={copySuggestions}
          actionDetail={copyActionDetail}
          isLoading={isLoadingCopySuggestions}
          onLoadSuggestions={handleLoadCopySuggestions}
          onCopySuggestions={handleCopySuggestions}
        />
        <p>基础版可完成本地粗剪生成，专业版提供更高效率的智能增强。</p>
      </div>
      <ScriptSegmentList segments={segments} candidatesBySegment={candidates} timeline={timeline} onSelectCandidate={handleSelectCandidate} />
    </section>
  )
}
