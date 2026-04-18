import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { getThumbDir } from './path-service.js'

export function probeVideoMetadata(filePath: string) {
  try {
    const output = execFileSync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-show_entries', 'stream=width,height',
      '-of', 'json',
      filePath,
    ], { encoding: 'utf8' })

    const parsed = JSON.parse(output)
    const stream = Array.isArray(parsed.streams) ? parsed.streams[0] : null
    return {
      durationMs: parsed.format?.duration ? Math.round(Number(parsed.format.duration) * 1000) : 2000,
      width: stream?.width ?? null,
      height: stream?.height ?? null,
    }
  } catch {
    return {
      durationMs: 2000,
      width: null,
      height: null,
    }
  }
}

export function generateThumbnail(filePath: string) {
  const thumbPath = path.join(getThumbDir(), `${path.basename(filePath, path.extname(filePath))}.jpg`)

  if (fs.existsSync(thumbPath)) {
    return thumbPath
  }

  try {
    execFileSync('ffmpeg', ['-y', '-i', filePath, '-frames:v', '1', thumbPath], { stdio: 'ignore' })
    return fs.existsSync(thumbPath) ? thumbPath : null
  } catch {
    return null
  }
}
