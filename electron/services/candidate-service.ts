import type { AssetRecord } from '../../src/shared/types/asset.js'
import type { CandidateAsset } from '../../src/shared/types/generation.js'
import type { ScriptSegment } from '../../src/shared/types/script.js'

export function rankCandidatesForSegment(segment: ScriptSegment, assets: AssetRecord[]): CandidateAsset[] {
  const preferredTag = segment.intentType === 'result'
    ? '结果展示'
    : segment.intentType === 'detail'
      ? '细节展示'
      : segment.intentType === 'demo'
        ? '操作过程'
        : '问题展示'

  return assets
    .filter(asset => asset.status !== 'disabled')
    .map(asset => ({
      assetId: asset.id,
      recallScore: 1,
      rankScore: asset.usageTags.includes(preferredTag) ? 10 + asset.qualityScore : asset.qualityScore,
      reasonSummary: `命中 ${preferredTag}`,
      similarPenalty: 0,
      usagePenalty: 0,
      selected: false,
    }))
    .sort((a, b) => b.rankScore - a.rankScore)
}
