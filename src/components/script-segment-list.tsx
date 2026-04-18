import { CandidateStrip } from './candidate-strip'
import type { CandidateAsset, TimelineClip } from '../shared/types/generation'
import type { ScriptSegment } from '../shared/types/script'

export function ScriptSegmentList({
  segments,
  candidatesBySegment = {},
  timeline = [],
  onSelectCandidate,
}: {
  segments: ScriptSegment[]
  candidatesBySegment?: Record<string, CandidateAsset[]>
  timeline?: TimelineClip[]
  onSelectCandidate?: (segmentId: string, assetId: string) => void
}) {
  return (
    <div className="segment-list">
      {segments.map(segment => {
        const selectedClip = timeline.find(clip => clip.segmentId === segment.id) ?? null
        const selectedCandidate = candidatesBySegment[segment.id]?.find(candidate => candidate.assetId === selectedClip?.assetId) ?? null
        return (
          <article key={segment.id} className="segment-card">
            <div className="segment-head">
              <strong>镜头位 {segment.index + 1}</strong>
              <span>{Math.round(segment.targetDurationMs / 1000)} 秒</span>
            </div>
            <p>{segment.text}</p>
            <div className="tag-row">
              <span>{segment.intentType}</span>
              <span>{segment.locked ? '已冻结' : '可替换'}</span>
              <span>候选 {candidatesBySegment[segment.id]?.length ?? 0} 条</span>
              <span>当前素材 {selectedClip?.assetId ?? '未选中'}</span>
            </div>
            {selectedCandidate ? <p>当前命中理由：{selectedCandidate.reasonSummary}</p> : <p>当前还未锁定具体候选素材。</p>}
            {candidatesBySegment[segment.id]?.length ? (
              <CandidateStrip
                candidates={candidatesBySegment[segment.id]}
                selectedAssetId={selectedClip?.assetId ?? null}
                onSelect={assetId => onSelectCandidate?.(segment.id, assetId)}
              />
            ) : null}
          </article>
        )
      })}
    </div>
  )
}
