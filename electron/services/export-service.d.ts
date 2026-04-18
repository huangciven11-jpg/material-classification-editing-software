import type { TimelineClip } from '../../src/shared/types/generation.js';
import type { AssetRecord } from '../../src/shared/types/asset.js';
export declare function exportTimelineToMp4(clips: TimelineClip[], assets: AssetRecord[]): {
    outputPath: string | null;
    detail: string;
};
