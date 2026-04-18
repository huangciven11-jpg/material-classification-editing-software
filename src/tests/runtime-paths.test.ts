import { describe, expect, it } from 'vitest'
import { resolveRendererTarget } from '../../electron/main'

describe('runtime path selection', () => {
  it('uses packaged file path when packaged mode is true', () => {
    const target = resolveRendererTarget({
      isPackaged: true,
      processResourcesPath: 'C:/app/resources',
      devServerUrl: 'http://127.0.0.1:5179',
    })

    expect(target.mode).toBe('file')
    expect(target.value).toContain('app.asar')
  })

  it('uses dev server url when packaged mode is false', () => {
    const target = resolveRendererTarget({
      isPackaged: false,
      processResourcesPath: 'C:/app/resources',
      devServerUrl: 'http://127.0.0.1:5179',
    })

    expect(target.mode).toBe('url')
    expect(target.value).toBe('http://127.0.0.1:5179')
  })
})
