import { useMemo, useState } from 'react'
import { MaterialGrid } from '../components/material-grid'
import { MaterialDetailPanel } from '../components/material-detail-panel'
import type { AssetCategory, AssetRecord } from '../shared/types/asset'

const categoryLabelMap: Record<AssetCategory, string> = {
  problem: '问题展示',
  demo: '操作过程',
  detail: '细节展示',
  result: '结果展示',
}

export function LibraryPage({
  assets,
  onImportComplete,
  lastImportSummary,
}: {
  assets: AssetRecord[]
  onImportComplete?: (pickedPathsCount: number) => Promise<void> | void
  lastImportSummary?: string
}) {
  const [selectedId, setSelectedId] = useState<string | null>(assets[0]?.id ?? null)
  const [isImporting, setIsImporting] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<'all' | AssetCategory>('all')
  const [searchText, setSearchText] = useState('')

  const visibleAssets = useMemo(() => {
    return assets.filter(asset => {
      const categoryOk = categoryFilter === 'all' || asset.category === categoryFilter
      const searchOk = !searchText.trim() || [
        asset.fileName,
        asset.categoryReason ?? '',
        ...asset.contentTags,
        ...asset.visualTags,
        ...asset.styleTags,
        ...asset.usageTags,
      ]
        .join(' ')
        .toLowerCase()
        .includes(searchText.trim().toLowerCase())
      return categoryOk && searchOk
    })
  }, [assets, categoryFilter, searchText])

  const selectedAsset = useMemo(() => visibleAssets.find(asset => asset.id === selectedId) ?? visibleAssets[0] ?? null, [visibleAssets, selectedId])
  const summary = useMemo(() => ({
    total: assets.length,
    favorite: assets.filter(asset => asset.status === 'favorite').length,
    active: assets.filter(asset => asset.status === 'active').length,
    problem: assets.filter(asset => asset.category === 'problem').length,
    demo: assets.filter(asset => asset.category === 'demo').length,
    detail: assets.filter(asset => asset.category === 'detail').length,
    result: assets.filter(asset => asset.category === 'result').length,
    highConfidence: assets.filter(asset => asset.categoryConfidence === 'high').length,
    mediumConfidence: assets.filter(asset => asset.categoryConfidence === 'medium').length,
    lowConfidence: assets.filter(asset => asset.categoryConfidence === 'low').length,
  }), [assets])

  async function handleImportDemo() {
    if (!window.materialEditorApi?.pickImportPaths || !window.materialEditorApi?.createImportTask) {
      return
    }

    setIsImporting(true)
    try {
      const pickedPaths = await window.materialEditorApi.pickImportPaths()
      if (!pickedPaths.length) {
        return
      }
      await window.materialEditorApi.createImportTask(pickedPaths)
      await onImportComplete?.(pickedPaths.length)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <section className="panel panel-column">
      <header className="panel-header">
        <div>
          <span className="eyebrow">素材资产中心</span>
          <h2>素材库</h2>
        </div>
        <button onClick={handleImportDemo} disabled={isImporting}>{isImporting ? '导入中...' : '导入素材'}</button>
      </header>
      <div className="tag-row">
        <span>素材总数 {summary.total}</span>
        <span>可用素材 {summary.active}</span>
        <span>收藏素材 {summary.favorite}</span>
        <span>高置信度 {summary.highConfidence}</span>
        <span>中置信度 {summary.mediumConfidence}</span>
        <span>低置信度 {summary.lowConfidence}</span>
        <span>问题 {summary.problem}</span>
        <span>过程 {summary.demo}</span>
        <span>细节 {summary.detail}</span>
        <span>结果 {summary.result}</span>
      </div>
      <div className="panel secondary-panel">
        <div className="panel-header">
          <strong>分类与搜索</strong>
        </div>
        <div className="tag-row">
          <button onClick={() => setCategoryFilter('all')}>全部</button>
          <button onClick={() => setCategoryFilter('problem')}>问题展示</button>
          <button onClick={() => setCategoryFilter('demo')}>操作过程</button>
          <button onClick={() => setCategoryFilter('detail')}>细节展示</button>
          <button onClick={() => setCategoryFilter('result')}>结果展示</button>
        </div>
        <input value={searchText} onChange={event => setSearchText(event.target.value)} placeholder="按文件名、分类原因或标签搜索素材" />
        <p>当前筛选结果：{visibleAssets.length} 条</p>
        <p>{lastImportSummary || '导入完成后，这里会显示本次导入分类摘要。'}</p>
      </div>
      <div className="two-column-layout">
        <MaterialGrid assets={visibleAssets} selectedId={selectedId} onSelect={asset => setSelectedId(asset.id)} />
        <div className="panel secondary-panel">
          <MaterialDetailPanel asset={selectedAsset} />
          {selectedAsset ? <p>主分类：{categoryLabelMap[selectedAsset.category]}</p> : null}
          {selectedAsset ? <p>分类置信度：{selectedAsset.categoryConfidence ?? 'low'}</p> : null}
        </div>
      </div>
    </section>
  )
}
