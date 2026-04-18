export type AssetStatus = 'active' | 'disabled' | 'downgraded' | 'favorite';
export type AssetRecord = {
    id: string;
    fileName: string;
    sourcePath: string;
    durationMs: number;
    thumbnailPath: string | null;
    contentTags: string[];
    visualTags: string[];
    styleTags: string[];
    usageTags: string[];
    similarGroupId: string | null;
    qualityScore: number;
    status: AssetStatus;
};
