import type { TimelineClip } from '../../src/shared/types/generation.js';
import type { ScriptSegment } from '../../src/shared/types/script.js';
export declare function buildTimeline(segments: ScriptSegment[], ranked: Record<string, Array<{
    assetId: string;
    rankScore: number;
}>>): TimelineClip[];
