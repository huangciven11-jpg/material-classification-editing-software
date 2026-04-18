import { describe, expect, it, vi, afterEach } from 'vitest'
import { fetchAssetTagEnhancementSuggestions } from '../../electron/services/asset-tag-enhancement-service'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('asset-tag-enhancement-service', () => {
  it('parses structured asset tag suggestions from json content', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify([
              {
                assetId: 'asset-1',
                suggestedTags: ['宠物毛', '清洁前'],
                reason: '脚本强调问题展示。',
              },
            ]),
          },
        }],
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const suggestions = await fetchAssetTagEnhancementSuggestions({
      baseUrl: 'https://api.example.com/v1',
      apiKey: 'test-key',
      model: 'test-model',
      payload: {
        script: '沙发上全是宠物毛。',
        assets: [{
          id: 'asset-1',
          fileName: 'before.mp4',
          category: 'problem',
          contentTags: [],
          visualTags: ['特写'],
          usageTags: ['问题展示'],
        }],
      },
    })

    expect(suggestions).toEqual([
      {
        assetId: 'asset-1',
        suggestedTags: ['宠物毛', '清洁前'],
        reason: '脚本强调问题展示。',
      },
    ])
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0]?.[1]?.body).toContain('test-model')
  })

  it('throws when response content is not valid json', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: 'not-json',
          },
        }],
      }),
    }))

    await expect(fetchAssetTagEnhancementSuggestions({
      baseUrl: 'https://api.example.com/v1',
      apiKey: 'test-key',
      model: 'test-model',
      payload: {
        script: '脚本',
        assets: [],
      },
    })).rejects.toThrow()
  })
})
