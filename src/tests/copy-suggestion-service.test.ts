import { describe, expect, it, vi, afterEach } from 'vitest'
import { fetchCopySuggestions, normalizeBaseUrl } from '../../electron/services/copy-suggestion-service'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('copy-suggestion-service', () => {
  it('normalizes base url by trimming trailing slash', () => {
    expect(normalizeBaseUrl('https://api.example.com/v1/')).toBe('https://api.example.com/v1')
  })

  it('splits returned text into suggestion lines', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: '标题：沙发去毛神器\n卖点：一刷即净\n开场：沙发上全是宠物毛？',
          },
        }],
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const suggestions = await fetchCopySuggestions({
      baseUrl: 'https://api.example.com/v1/',
      apiKey: 'test-key',
      model: 'test-model',
      script: '沙发上全是宠物毛。轻轻一刷就干净。',
    })

    expect(suggestions).toEqual([
      '标题：沙发去毛神器',
      '卖点：一刷即净',
      '开场：沙发上全是宠物毛？',
    ])
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0]?.[1]?.body).toContain('test-model')
  })

  it('throws when response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }))

    await expect(fetchCopySuggestions({
      baseUrl: 'https://api.example.com/v1',
      apiKey: 'test-key',
      model: 'test-model',
      script: '脚本',
    })).rejects.toThrow('文案建议请求失败：HTTP 500')
  })
})
