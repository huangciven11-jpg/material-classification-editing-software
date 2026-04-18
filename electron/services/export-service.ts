import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import type { TimelineClip } from '../../src/shared/types/generation.js'
import type { AssetRecord } from '../../src/shared/types/asset.js'
import { getExportDir } from './path-service.js'

function writeConcatList(clips: TimelineClip[], assets: AssetRecord[]) {
  const exportDir = getExportDir()
  const listPath = path.join(exportDir, 'concat-list.txt')
  const lines = clips
    .map(clip => assets.find(asset => asset.id === clip.assetId)?.sourcePath)
    .filter((value): value is string => Boolean(value))
    .map(filePath => `file '${filePath.replace(/'/g, "'\\''")}'`)
  fs.writeFileSync(listPath, lines.join('\n'), 'utf8')
  return listPath
}

export function exportTimelineToMp4(clips: TimelineClip[], assets: AssetRecord[]) {
  const exportDir = getExportDir()
  const outputPath = path.join(exportDir, 'final.mp4')
  const listPath = writeConcatList(clips, assets)

  if (clips.length === 0) {
    return { outputPath: null, detail: '没有可导出的成片片段。' }
  }

  try {
    execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', outputPath], {
      stdio: 'ignore',
    })
    return {
      outputPath: fs.existsSync(outputPath) ? outputPath : null,
      detail: fs.existsSync(outputPath) ? `已导出完整成片：${outputPath}` : '成片导出完成但未找到输出文件。',
    }
  } catch {
    return {
      outputPath: null,
      detail: 'FFmpeg 成片导出失败，请检查素材编码或本机 ffmpeg。',
    }
  }
}
