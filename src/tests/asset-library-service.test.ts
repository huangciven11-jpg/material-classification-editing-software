import path from 'node:path'
import os from 'node:os'
import { describe, expect, it, beforeEach } from 'vitest'

beforeEach(async () => {
  const tempDir = path.join(os.tmpdir(), `material-editor-test-${Date.now()}-${Math.random()}`)
  process.env.MATERIAL_EDITOR_DB_PATH = path.join(tempDir, 'material-editor.db')
  const dbModule = await import('../../electron/services/db')
  dbModule.resetDb()
})

describe('asset-library-service', () => {
  it('applies suggested tags into content tags and deduplicates them', async () => {
    const { createAssetLibraryService } = await import('../../electron/services/asset-library-service')
    const service = createAssetLibraryService()
    service.seedDemoAssets()
    const asset = service.listAssets()[0]

    const result = service.applySuggestedTags(asset.id, ['宠物毛', '新标签', '新标签'])
    const updated = service.listAssets().find(item => item.id === asset.id)

    expect(result.success).toBe(true)
    expect(updated?.contentTags).toContain('新标签')
    expect(updated?.contentTags.filter(tag => tag === '新标签')).toHaveLength(1)
  })

  it('returns failure when asset does not exist', async () => {
    const { createAssetLibraryService } = await import('../../electron/services/asset-library-service')
    const service = createAssetLibraryService()
    const result = service.applySuggestedTags('missing-asset', ['标签'])

    expect(result.success).toBe(false)
    expect(result.detail).toContain('未找到对应素材')
  })
})
