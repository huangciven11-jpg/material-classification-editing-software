export type CandidateAsset = {
  assetId: string
  recallScore: number
  rankScore: number
  reasonSummary: string
  similarPenalty: number
  usagePenalty: number
  selected: boolean
}

export type TimelineClip = {
  segmentId: string
  assetId: string | null
  timelineStartMs: number
  timelineEndMs: number
}

export type GenerationResult = {
  segments: import('./script').ScriptSegment[]
  timeline: TimelineClip[]
  candidates: Record<string, CandidateAsset[]>
}
