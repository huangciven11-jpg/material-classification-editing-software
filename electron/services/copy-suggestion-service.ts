export function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, '')
}

export async function fetchCopySuggestions(input: {
  baseUrl: string
  apiKey: string
  model: string
  script: string
}) {
  const response = await fetch(`${normalizeBaseUrl(input.baseUrl)}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.apiKey}`,
    },
    body: JSON.stringify({
      model: input.model,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: '你是电商短视频文案助手。请根据脚本输出 3 条简短建议：1 条标题建议、1 条卖点表达、1 条开场句。每条单独一行。',
        },
        {
          role: 'user',
          content: `脚本内容：${input.script}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`文案建议请求失败：HTTP ${response.status}`)
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
    throw new Error('文案建议解析失败')
  }

  return content
    .split(/\r?\n/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 3)
}
