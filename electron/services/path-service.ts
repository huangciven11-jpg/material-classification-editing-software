import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export function getWorkspaceRoot() {
  const root = path.join(os.homedir(), 'Desktop', '素材分类剪辑软件')
  fs.mkdirSync(root, { recursive: true })
  return root
}

export function getDataDir() {
  const dir = path.join(getWorkspaceRoot(), 'data')
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

export function getThumbDir() {
  const dir = path.join(getWorkspaceRoot(), 'thumbs')
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

export function getExportDir() {
  const dir = path.join(getWorkspaceRoot(), 'exports')
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

export function getDatabasePath() {
  return path.join(getDataDir(), 'material-editor.db')
}
