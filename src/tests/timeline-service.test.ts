import { describe, expect, it } from 'vitest'
import { buildTimeline } from '../../electron/services/timeline-service'

describe('timeline-service', () => {
  it('builds sequential timeline clips', () => {
    const clips = buildTimeline([
      { id: 'segment-1', index: 0, text: '问题', intentType: 'problem', targetDurationMs: 1500, locked: false },
      { id: 'segment-2', index: 1, text: '结果', intentType: 'result', targetDurationMs: 1800, locked: false },
    ], {
      'segment-1': [{ assetId: 'asset-a', rankScore: 5 }],
      'segment-2': [{ assetId: 'asset-b', rankScore: 9 }],
    })

    expect(clips).toHaveLength(2)
    expect(clips[1].timelineStartMs).toBe(1500)
    expect(clips[1].assetId).toBe('asset-b')
  })
})
