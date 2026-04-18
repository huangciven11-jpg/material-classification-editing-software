export type AssetStatus = 'active' | 'disabled' | 'downgraded' | 'favorite'

export type AssetCategory = 'problem' | 'demo' | 'detail' | 'result'

export type AssetRecord = {
  id: string
  fileName: string
  sourcePath: string
  durationMs: number
  thumbnailPath: string | null
  width?: number | null
  height?: number | null
  category: AssetCategory
  categoryReason?: string | null
  categoryConfidence?: 'low' | 'medium' | 'high'
  contentTags: string[]
  visualTags: string[]
  styleTags: string[]
  usageTags: string[]
  similarGroupId: string | null
  qualityScore: number
  status: AssetStatus
}
