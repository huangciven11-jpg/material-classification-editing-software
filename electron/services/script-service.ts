import type { ScriptSegment } from '../../src/shared/types/script.js'

export function splitScriptIntoSegments(script: string): ScriptSegment[] {
  return script
    .split(/[。！？!?.]/)
    .map(part => part.trim())
    .filter(Boolean)
    .map((text, index) => ({
      id: `segment-${index + 1}`,
      index,
      text,
      intentType: text.includes('干净') ? 'result' : text.includes('细节') ? 'detail' : text.includes('使用') ? 'demo' : 'problem',
      targetDurationMs: Math.max(1200, text.length * 220),
      locked: false,
    }))
}
