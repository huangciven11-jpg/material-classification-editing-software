import type { AssetCategory, AssetRecord } from '../../src/shared/types/asset.js'

type AssetAnalysisInput = {
  fileName: string
  durationMs?: number
  width?: number | null
  height?: number | null
}

export function analyzeAssetFileName(input: string | AssetAnalysisInput) {
  const normalizedInput = typeof input === 'string' ? { fileName: input } : input
  const lower = normalizedInput.fileName.toLowerCase()
  const durationMs = normalizedInput.durationMs ?? 2000
  const width = normalizedInput.width ?? null
  const height = normalizedInput.height ?? null
  const isPortrait = Boolean(width && height && height > width)
  const isShortClip = durationMs <= 2500
  const isLongClip = durationMs >= 5000

  const hasResultSignal = lower.includes('结果') || lower.includes('干净') || lower.includes('前后对比') || lower.includes('焕新') || lower.includes('见效')
  const hasDetailSignal = lower.includes('特写') || lower.includes('细节') || lower.includes('局部') || lower.includes('纹理') || lower.includes('材质')
  const hasDemoSignal = lower.includes('使用') || lower.includes('刷') || lower.includes('演示') || lower.includes('过程') || lower.includes('来回') || lower.includes('滚动')
  const hasProblemSignal = lower.includes('使用前') || lower.includes('毛发') || lower.includes('脏') || lower.includes('待清理')
  const hasWarmSignal = lower.includes('暖光')
  const hasBrightSignal = lower.includes('明亮')
  const hasSofaSignal = lower.includes('沙发')
  const hasPetHairSignal = lower.includes('毛') || lower.includes('宠物') || lower.includes('猫')

  let category: AssetCategory = 'problem'
  let categoryReason = '未命中强信号，按问题展示兜底。'
  let categoryConfidence: 'low' | 'medium' | 'high' = 'low'

  if (hasResultSignal) {
    category = 'result'
    categoryReason = '命中结果类关键词，如结果/干净/前后对比/见效。'
    categoryConfidence = 'high'
  } else if (hasDemoSignal && !isShortClip) {
    category = 'demo'
    categoryReason = '命中过程类关键词，且时长足以承载操作过程。'
    categoryConfidence = 'high'
  } else if (hasDetailSignal || (isShortClip && !hasDemoSignal)) {
    category = 'detail'
    categoryReason = hasDetailSignal
      ? '命中特写/细节/局部/材质等细节信号。'
      : '片段较短且无明显过程信号，更适合作为细节展示。'
    categoryConfidence = hasDetailSignal ? 'high' : 'medium'
  } else if (hasProblemSignal) {
    category = 'problem'
    categoryReason = '命中问题状态关键词，如使用前/毛发/待清理。'
    categoryConfidence = 'medium'
  } else if (isPortrait || isLongClip) {
    category = 'demo'
    categoryReason = isPortrait
      ? '竖屏长过程素材更偏向操作过程展示。'
      : '片段较长，更适合过程展示。'
    categoryConfidence = 'medium'
  }

  const contentTags = hasPetHairSignal
    ? ['宠物毛']
    : hasSofaSignal
      ? ['沙发场景']
      : ['通用内容']

  const visualTags = [
    hasDetailSignal ? '特写' : isPortrait ? '竖屏景别' : '常规景别',
    hasSofaSignal ? '家居背景' : '通用背景',
  ]

  const styleTags = [
    hasWarmSignal ? '暖光' : hasBrightSignal ? '明亮' : '常规光线',
    category === 'result' ? '结果氛围' : category === 'demo' ? '过程氛围' : category === 'detail' ? '细节氛围' : '问题氛围',
  ]

  const usageTags = category === 'result'
    ? ['结果展示']
    : category === 'demo'
      ? ['操作过程']
      : category === 'detail'
        ? ['细节展示']
        : ['问题展示']

  return {
    category,
    categoryReason,
    categoryConfidence,
    contentTags,
    visualTags,
    styleTags,
    usageTags,
    qualityScore: category === 'result' ? 0.92 : category === 'detail' ? 0.86 : category === 'demo' ? 0.84 : 0.8,
  }
}

export function buildAssetRecord(
  fileName: string,
  options: {
    sourcePath?: string
    durationMs?: number
    thumbnailPath?: string | null
    width?: number | null
    height?: number | null
  } = {},
): AssetRecord {
  const analysis = analyzeAssetFileName({
    fileName,
    durationMs: options.durationMs,
    width: options.width,
    height: options.height,
  })

  return {
    id: `${options.sourcePath ?? fileName}`,
    fileName,
    sourcePath: options.sourcePath ?? `D:/assets/${fileName}`,
    durationMs: options.durationMs ?? 2000,
    thumbnailPath: options.thumbnailPath ?? null,
    width: options.width ?? null,
    height: options.height ?? null,
    category: analysis.category,
    categoryReason: analysis.categoryReason,
    categoryConfidence: analysis.categoryConfidence,
    contentTags: analysis.contentTags,
    visualTags: analysis.visualTags,
    styleTags: analysis.styleTags,
    usageTags: analysis.usageTags,
    similarGroupId: null,
    qualityScore: analysis.qualityScore,
    status: 'active',
  }
}
