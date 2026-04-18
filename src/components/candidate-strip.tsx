import type { CandidateAsset } from '../shared/types/generation'

export function CandidateStrip({
  candidates,
  selectedAssetId,
  onSelect,
}: {
  candidates: CandidateAsset[]
  selectedAssetId?: string | null
  onSelect?: (assetId: string) => void
}) {
  return (
    <div className="segment-list">
      {candidates.map(candidate => (
        <article key={candidate.assetId} className="segment-card">
          <div className="segment-head">
            <strong>{candidate.assetId}</strong>
            <span>{candidate.rankScore.toFixed(2)}</span>
          </div>
          <p>{candidate.reasonSummary}</p>
          <div className="tag-row">
            <span>召回 {candidate.recallScore}</span>
            <span>相似惩罚 {candidate.similarPenalty}</span>
            <span>使用惩罚 {candidate.usagePenalty}</span>
            <span>{selectedAssetId === candidate.assetId ? '当前已选' : '可选'}</span>
          </div>
          {onSelect ? (
            <button onClick={() => onSelect(candidate.assetId)} disabled={selectedAssetId === candidate.assetId}>
              {selectedAssetId === candidate.assetId ? '当前选中' : '选用这条素材'}
            </button>
          ) : null}
        </article>
      ))}
    </div>
  )
}
