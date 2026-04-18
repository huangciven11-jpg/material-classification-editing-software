type AssetTagEnhancementInput = {
  script: string
  assets: Array<{
    id: string
    fileName: string
    category: string
    contentTags: string[]
    visualTags: string[]
    usageTags: string[]
  }>
}

type AssetTagEnhancementResult = Array<{
  assetId: string
  suggestedTags: string[]
  reason: string
}>

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, '')
}

export async function fetchAssetTagEnhancementSuggestions(input: {
  baseUrl: string
  apiKey: string
  model: string
  payload: AssetTagEnhancementInput
}) {
  const response = await fetch(`${normalizeBaseUrl(input.baseUrl)}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.apiKey}`,
    },
    body: JSON.stringify({
      model: input.model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: '你是电商素材标签增强助手。请根据脚本和素材信息，为每条素材补充最合适的标签建议。只返回 JSON 数组。每项包含 assetId、suggestedTags、reason。不要输出额外说明。',
        },
        {
          role: 'user',
          content: JSON.stringify(input.payload),
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`标签增强请求失败：HTTP ${response.status}`)
  }

  const data = await response.json() as {
    choices?: Array<{
      message?: {
        content?: string
      }
    }>
  }

  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) {
    throw new Error('标签增强结果解析失败')
  }

  const parsed = JSON.parse(content) as AssetTagEnhancementResult
  return parsed
}
