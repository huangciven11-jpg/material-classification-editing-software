import type { AssetRecord } from '../shared/types/asset'
import type { TimelineClip } from '../shared/types/generation'

export function VersionPreview({
  clips,
  assets = [],
  selectedClipIndex,
}: {
  clips: TimelineClip[]
  assets?: AssetRecord[]
  selectedClipIndex?: number
}) {
  return (
    <div className="segment-list">
      {clips.map((clip, index) => {
        const asset = assets.find(item => item.id === clip.assetId) ?? null
        return (
          <article
            key={`${clip.segmentId}-${index}`}
            className={`segment-card ${selectedClipIndex === index ? 'selected' : ''}`}
          >
            <div className="segment-head">
              <strong>片段 {index + 1}</strong>
              <span>{Math.round((clip.timelineEndMs - clip.timelineStartMs) / 1000)} 秒</span>
            </div>
            <div className="thumb">
              {asset?.thumbnailPath ? (
                <img src={`file:///${asset.thumbnailPath.replace(/\\/g, '/')}`} alt={asset.fileName} />
              ) : (
                <span>无缩略图</span>
              )}
            </div>
            <p>素材：{asset?.fileName ?? clip.assetId ?? '未匹配'}</p>
            <div className="tag-row">
              <span>起点 {Math.round(clip.timelineStartMs / 1000)}s</span>
              <span>终点 {Math.round(clip.timelineEndMs / 1000)}s</span>
              {asset?.usageTags?.[0] ? <span>{asset.usageTags[0]}</span> : null}
            </div>
          </article>
        )
      })}
    </div>
  )
}
