import type { TimelineClip } from '../../src/shared/types/generation.js'
import type { ScriptSegment } from '../../src/shared/types/script.js'

export function buildTimeline(
  segments: ScriptSegment[],
  ranked: Record<string, Array<{ assetId: string; rankScore: number }>>,
): TimelineClip[] {
  let cursor = 0

  return segments.map(segment => {
    const topCandidate = ranked[segment.id]?.[0]
    const clip: TimelineClip = {
      segmentId: segment.id,
      assetId: topCandidate?.assetId ?? null,
      timelineStartMs: cursor,
      timelineEndMs: cursor + segment.targetDurationMs,
    }
    cursor = clip.timelineEndMs
    return clip
  })
}
