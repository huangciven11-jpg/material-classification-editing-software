declare global {
  interface Window {
    materialEditorApi?: {
      listAssets: () => Promise<import('./shared/types/asset').AssetRecord[]>
      listTasks: () => Promise<import('./shared/types/task').TaskRecord[]>
      pickImportPaths: () => Promise<string[]>
      createImportTask: (paths: string[]) => Promise<string>
      applyTagSuggestions: (input: {
        assetId: string
        suggestedTags: string[]
      }) => Promise<{
        success: boolean
        detail: string
      }>
      generateFromScript: (script: string) => Promise<import('./shared/types/generation').GenerationResult>
      exportTimeline: (timeline: import('./shared/types/generation').TimelineClip[]) => Promise<{
        outputPath: string | null
        detail: string
      }>
      getApiConfig: () => Promise<{
        provider: string
        baseUrl: string
        model: string
        hasApiKey: boolean
        apiKeyMasked: string
        updatedAt: string
        detail?: string
      }>
      saveApiConfig: (input: {
        provider: string
        baseUrl: string
        model: string
        apiKey: string
      }) => Promise<{
        provider: string
        baseUrl: string
        model: string
        hasApiKey: boolean
        apiKeyMasked: string
        updatedAt: string
        detail?: string
      }>
      enhanceAssetTags: (input: {
        script: string
        assets: Array<{
          id: string
          fileName: string
          category: string
          contentTags: string[]
          visualTags: string[]
          usageTags: string[]
        }>
      }) => Promise<{
        enabled: boolean
        detail: string
        suggestions: Array<{
          assetId: string
          fileName: string
          suggestedTags: string[]
          reason: string
        }>
      }>
      getCopySuggestions: (input: {
        script: string
      }) => Promise<{
        enabled: boolean
        detail: string
        suggestions: string[]
      }>
      captureWindow: () => Promise<string>
    }
  }
}

export {}
