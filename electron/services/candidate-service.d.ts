import type { AssetRecord } from '../../src/shared/types/asset.js';
import type { CandidateAsset } from '../../src/shared/types/generation.js';
import type { ScriptSegment } from '../../src/shared/types/script.js';
export declare function rankCandidatesForSegment(segment: ScriptSegment, assets: AssetRecord[]): CandidateAsset[];
