import type { AssetCategory, AssetRecord } from '../shared/types/asset'

const categoryLabelMap: Record<AssetCategory, string> = {
  problem: '问题展示',
  demo: '操作过程',
  detail: '细节展示',
  result: '结果展示',
}

export function MaterialGrid({
  assets,
  selectedId,
  onSelect,
}: {
  assets: AssetRecord[]
  selectedId: string | null
  onSelect: (asset: AssetRecord) => void
}) {
  return (
    <div className="material-grid">
      {assets.map(asset => (
        <article
          key={asset.id}
          className={`material-card ${selectedId === asset.id ? 'selected' : ''}`}
          onClick={() => onSelect(asset)}
        >
          <div className="thumb">
            {asset.thumbnailPath ? (
              <img src={`file:///${asset.thumbnailPath.replace(/\\/g, '/')}`} alt={asset.fileName} />
            ) : (
              <span>{asset.fileName.slice(0, 4)}</span>
            )}
          </div>
          <strong>{asset.fileName}</strong>
          <span>{Math.round(asset.durationMs / 1000)} 秒</span>
          <span>{asset.status}</span>
          <span>{asset.width && asset.height ? `${asset.width} × ${asset.height}` : '分辨率待探测'}</span>
          <div className="tag-row">
            <span>{categoryLabelMap[asset.category]}</span>
            <span>{asset.categoryConfidence ?? 'low'}</span>
            {asset.usageTags.concat(asset.visualTags).slice(0, 2).map(tag => <span key={tag}>{tag}</span>)}
          </div>
          <p>{asset.categoryReason ?? '当前未记录分类原因'}</p>
        </article>
      ))}
    </div>
  )
}
