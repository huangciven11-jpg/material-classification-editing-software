import { describe, expect, it } from 'vitest'
import { splitScriptIntoSegments } from '../../electron/services/script-service'

describe('script-service', () => {
  it('splits script into ordered segments', () => {
    const segments = splitScriptIntoSegments('沙发上全是猫毛。轻轻一刷就干净。')
    expect(segments).toHaveLength(2)
    expect(segments[0].intentType).toBe('problem')
    expect(segments[1].intentType).toBe('result')
  })
})
