import { describe, expect, it } from 'vitest'
import { rankCandidatesForSegment } from '../../electron/services/candidate-service'
import type { AssetRecord } from '../shared/types/asset'

const assets: AssetRecord[] = [
  {
    id: 'result',
    fileName: 'result.mp4',
    sourcePath: 'result.mp4',
    durationMs: 2000,
    thumbnailPath: null,
    width: null,
    height: null,
    category: 'result',
    contentTags: [],
    visualTags: [],
    styleTags: [],
    usageTags: ['结果展示'],
    similarGroupId: null,
    qualityScore: 0.9,
    status: 'active',
  },
  {
    id: 'problem',
    fileName: 'problem.mp4',
    sourcePath: 'problem.mp4',
    durationMs: 2000,
    thumbnailPath: null,
    width: null,
    height: null,
    category: 'problem',
    contentTags: [],
    visualTags: [],
    styleTags: [],
    usageTags: ['问题展示'],
    similarGroupId: null,
    qualityScore: 0.9,
    status: 'active',
  },
]

describe('candidate-service', () => {
  it('ranks result assets first for result segments', () => {
    const ranked = rankCandidatesForSegment({
      id: 'segment-1',
      index: 0,
      text: '轻轻一刷就干净',
      intentType: 'result',
      targetDurationMs: 1800,
      locked: false,
    }, assets)

    expect(ranked[0].assetId).toBe('result')
  })
})
