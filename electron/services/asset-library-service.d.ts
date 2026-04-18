import type { AssetRecord } from '../../src/shared/types/asset.js';
export declare function createAssetLibraryService(): {
    seedDemoAssets(): void;
    upsertAsset(asset: AssetRecord): void;
    listAssets(): AssetRecord[];
};
