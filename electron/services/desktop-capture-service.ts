import screenshot from 'screenshot-desktop'
import path from 'node:path'
import { getExportDir } from './path-service.js'

export async function captureDesktopScreenshot(fileName = 'window-capture.png') {
  const outputPath = path.join(getExportDir(), fileName)
  await screenshot({ filename: outputPath })
  return outputPath
}
