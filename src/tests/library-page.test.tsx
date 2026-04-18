import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { LibraryPage } from '../pages/library-page'
import type { AssetRecord } from '../shared/types/asset'

const assets: AssetRecord[] = [
  {
    id: 'asset-1',
    fileName: '沙发-宠物毛-特写.mp4',
    sourcePath: 'D:/assets/沙发-宠物毛-特写.mp4',
    durationMs: 2200,
    thumbnailPath: null,
    width: null,
    height: null,
    category: 'problem',
    categoryReason: '默认问题展示示例素材。',
    categoryConfidence: 'medium',
    contentTags: ['宠物毛'],
    visualTags: ['特写'],
    styleTags: ['暖光'],
    usageTags: ['问题展示'],
    similarGroupId: 'g-1',
    qualityScore: 0.83,
    status: 'active',
  },
]

afterEach(() => {
  cleanup()
})

describe('LibraryPage', () => {
  it('shows recent added tags in both card and detail area', () => {
    render(
      <LibraryPage
        assets={assets}
        recentAddedTagsByAsset={{
          'asset-1': ['新标签', '清洁前'],
        }}
      />,
    )

    expect(screen.getByText('本次新增标签：新标签、清洁前')).toBeTruthy()
    expect(screen.getAllByText('新标签').length).toBeGreaterThan(0)
    expect(screen.getAllByText('清洁前').length).toBeGreaterThan(0)
  })

  it('does not show recent added tag text when no recent tags exist', () => {
    render(<LibraryPage assets={assets} recentAddedTagsByAsset={{}} />)

    expect(screen.queryByText(/本次新增标签：/)).toBeNull()
    expect(screen.queryByText(/^新标签$/)).toBeNull()
    expect(screen.queryByText(/^清洁前$/)).toBeNull()
  })
})
