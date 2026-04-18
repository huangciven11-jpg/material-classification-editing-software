import type { AssetRecord } from '../../src/shared/types/asset.js';
export declare function createAssetIngestService(): {
    importPaths(paths: string[]): AssetRecord[];
};
