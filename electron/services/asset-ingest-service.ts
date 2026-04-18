import fs from 'node:fs'
import path from 'node:path'
import type { AssetRecord } from '../../src/shared/types/asset.js'
import { buildAssetRecord } from './asset-analysis-service.js'
import { createAssetLibraryService } from './asset-library-service.js'
import { generateThumbnail, probeVideoMetadata } from './media-service.js'

const videoExtensions = new Set(['.mp4', '.mov', '.mkv', '.avi'])

export function createAssetIngestService() {
  const assetLibrary = createAssetLibraryService()

  function createImportedAsset(fullPath: string): AssetRecord {
    const fileName = path.basename(fullPath)
    const metadata = probeVideoMetadata(fullPath)
    const thumbnailPath = generateThumbnail(fullPath)
    return buildAssetRecord(fileName, {
      sourcePath: fullPath,
      durationMs: metadata.durationMs,
      thumbnailPath,
      width: metadata.width,
      height: metadata.height,
    })
  }

  return {
    importPaths(paths: string[]): AssetRecord[] {
      const imported: AssetRecord[] = []

      for (const inputPath of paths) {
        if (!fs.existsSync(inputPath)) {
          continue
        }

        const stat = fs.statSync(inputPath)
        if (stat.isDirectory()) {
          const entries = fs.readdirSync(inputPath, { withFileTypes: true })
          for (const entry of entries) {
            if (!entry.isFile()) continue
            if (!videoExtensions.has(path.extname(entry.name).toLowerCase())) continue
            const fullPath = path.join(inputPath, entry.name)
            imported.push(createImportedAsset(fullPath))
          }
          continue
        }

        if (stat.isFile() && videoExtensions.has(path.extname(inputPath).toLowerCase())) {
          imported.push(createImportedAsset(inputPath))
        }
      }

      for (const asset of imported) {
        assetLibrary.upsertAsset(asset)
      }

      return imported
    },
  }
}
