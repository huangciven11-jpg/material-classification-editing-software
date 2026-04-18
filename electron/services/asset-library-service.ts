import type { AssetRecord } from '../../src/shared/types/asset.js'
import { buildAssetRecord } from './asset-analysis-service.js'
import { getDb } from './db.js'

type AssetRow = {
  id: string
  file_name: string
  source_path: string
  duration_ms: number
  thumbnail_path: string | null
  width: number | null
  height: number | null
  category: AssetRecord['category']
  category_reason: string | null
  category_confidence: AssetRecord['categoryConfidence'] | null
  content_tags: string
  visual_tags: string
  style_tags: string
  usage_tags: string
  similar_group_id: string | null
  quality_score: number
  status: AssetRecord['status']
}

function toDbRecord(asset: AssetRecord) {
  return {
    id: asset.id,
    file_name: asset.fileName,
    source_path: asset.sourcePath,
    duration_ms: asset.durationMs,
    thumbnail_path: asset.thumbnailPath,
    width: asset.width ?? null,
    height: asset.height ?? null,
    category: asset.category,
    category_reason: asset.categoryReason ?? null,
    category_confidence: asset.categoryConfidence ?? null,
    content_tags: JSON.stringify(asset.contentTags),
    visual_tags: JSON.stringify(asset.visualTags),
    style_tags: JSON.stringify(asset.styleTags),
    usage_tags: JSON.stringify(asset.usageTags),
    similar_group_id: asset.similarGroupId,
    quality_score: asset.qualityScore,
    status: asset.status,
    created_at: new Date().toISOString(),
  }
}

function addColumnIfMissing(db: ReturnType<typeof getDb>, sql: string) {
  try {
    db.exec(sql)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (!message.includes('duplicate column name')) {
      throw error
    }
  }
}

export function createAssetLibraryService() {
  const db = getDb()

  addColumnIfMissing(db, `ALTER TABLE assets ADD COLUMN width INTEGER;`)
  addColumnIfMissing(db, `ALTER TABLE assets ADD COLUMN height INTEGER;`)
  addColumnIfMissing(db, `ALTER TABLE assets ADD COLUMN category TEXT DEFAULT 'problem';`)
  addColumnIfMissing(db, `ALTER TABLE assets ADD COLUMN category_reason TEXT;`)
  addColumnIfMissing(db, `ALTER TABLE assets ADD COLUMN category_confidence TEXT;`)

  const insertAsset = db.prepare(`
    INSERT OR REPLACE INTO assets (id, file_name, source_path, duration_ms, thumbnail_path, width, height, category, category_reason, category_confidence, content_tags, visual_tags, style_tags, usage_tags, similar_group_id, quality_score, status, created_at)
    VALUES (@id, @file_name, @source_path, @duration_ms, @thumbnail_path, @width, @height, @category, @category_reason, @category_confidence, @content_tags, @visual_tags, @style_tags, @usage_tags, @similar_group_id, @quality_score, @status, @created_at)
  `)

  const selectAssets = db.prepare<[], AssetRow>(`
    SELECT id, file_name, source_path, duration_ms, thumbnail_path, width, height, category, category_reason, category_confidence, content_tags, visual_tags, style_tags, usage_tags, similar_group_id, quality_score, status
    FROM assets
    ORDER BY created_at DESC
  `)

  function listAssets(): AssetRecord[] {
    return selectAssets.all().map((row: AssetRow) => ({
      id: String(row.id),
      fileName: String(row.file_name),
      sourcePath: String(row.source_path),
      durationMs: Number(row.duration_ms),
      thumbnailPath: row.thumbnail_path ? String(row.thumbnail_path) : null,
      width: typeof row.width === 'number' ? row.width : null,
      height: typeof row.height === 'number' ? row.height : null,
      category: row.category,
      categoryReason: row.category_reason ? String(row.category_reason) : null,
      categoryConfidence: row.category_confidence ?? 'low',
      contentTags: JSON.parse(String(row.content_tags)),
      visualTags: JSON.parse(String(row.visual_tags)),
      styleTags: JSON.parse(String(row.style_tags)),
      usageTags: JSON.parse(String(row.usage_tags)),
      similarGroupId: row.similar_group_id ? String(row.similar_group_id) : null,
      qualityScore: Number(row.quality_score),
      status: row.status,
    }))
  }

  return {
    seedDemoAssets() {
      const files = ['沙发-宠物毛-特写.mp4', '沙发-一刷干净-结果.mp4']
      for (const file of files) {
        insertAsset.run(toDbRecord(buildAssetRecord(file)))
      }
    },
    upsertAsset(asset: AssetRecord) {
      insertAsset.run(toDbRecord(asset))
    },
    listAssets,
    applySuggestedTags(assetId: string, suggestedTags: string[]) {
      const assets = listAssets()
      const asset = assets.find(item => item.id === assetId)
      if (!asset) {
        return {
          success: false,
          detail: '未找到对应素材，无法应用标签。',
        }
      }

      const mergedTags = Array.from(new Set([...asset.contentTags, ...suggestedTags.map(tag => tag.trim()).filter(Boolean)]))
      insertAsset.run(toDbRecord({
        ...asset,
        contentTags: mergedTags,
      }))

      return {
        success: true,
        detail: `已将 ${mergedTags.length - asset.contentTags.length} 个建议标签写入 ${asset.fileName}。`,
      }
    },
  }
}
