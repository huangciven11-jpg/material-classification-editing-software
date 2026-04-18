import { describe, expect, it } from 'vitest'
import { analyzeAssetFileName } from '../../electron/services/asset-analysis-service'

describe('asset-analysis-service', () => {
  it('extracts ecommerce-friendly tags from file names', () => {
    const result = analyzeAssetFileName('沙发-宠物毛-特写-暖光-结果.mp4')
    expect(result.contentTags).toContain('宠物毛')
    expect(result.visualTags).toContain('特写')
    expect(result.styleTags).toContain('暖光')
    expect(result.usageTags).toContain('结果展示')
  })
})
