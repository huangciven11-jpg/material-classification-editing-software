import type { AssetRecord } from '../../src/shared/types/asset';
export declare function analyzeAssetFileName(fileName: string): {
    contentTags: string[];
    visualTags: string[];
    styleTags: string[];
    usageTags: string[];
    qualityScore: number;
};
export declare function buildAssetRecord(fileName: string, options?: {
    sourcePath?: string;
    durationMs?: number;
    thumbnailPath?: string | null;
}): AssetRecord;
