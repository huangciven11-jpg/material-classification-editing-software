import { useEffect, useState } from 'react'

export function SettingsPage() {
  const [captureDetail, setCaptureDetail] = useState('')
  const [isCapturing, setIsCapturing] = useState(false)
  const [provider, setProvider] = useState('OpenAI Compatible')
  const [apiBaseUrl, setApiBaseUrl] = useState('https://api.example.com/v1')
  const [model, setModel] = useState('gpt-4o-mini')
  const [apiKey, setApiKey] = useState('')
  const [apiKeyMasked, setApiKeyMasked] = useState('未配置')
  const [apiConfigDetail, setApiConfigDetail] = useState('正在读取本地 API 配置...')
  const [isSavingApiConfig, setIsSavingApiConfig] = useState(false)

  useEffect(() => {
    let disposed = false

    async function loadApiConfig() {
      if (!window.materialEditorApi?.getApiConfig) {
        setApiConfigDetail('当前环境未接入专业版 API 配置读取。')
        return
      }

      try {
        const result = await window.materialEditorApi.getApiConfig()
        if (disposed) {
          return
        }

        setProvider(result.provider)
        setApiBaseUrl(result.baseUrl)
        setModel(result.model)
        setApiKey('')
        setApiKeyMasked(result.apiKeyMasked || '未配置')
        setApiConfigDetail(result.detail || '已读取本地 API 配置。')
      } catch {
        if (disposed) {
          return
        }

        setApiConfigDetail('本地 API 配置读取失败，请稍后重试。')
      }
    }

    void loadApiConfig()

    return () => {
      disposed = true
    }
  }, [])

  async function handleCapture() {
    if (!window.materialEditorApi?.captureWindow) {
      setCaptureDetail('当前环境未接入窗口截图。')
      return
    }

    setIsCapturing(true)
    try {
      const outputPath = await window.materialEditorApi.captureWindow()
      setCaptureDetail(`截图已保存：${outputPath}`)
    } finally {
      setIsCapturing(false)
    }
  }

  async function handleSaveApiConfig() {
    if (!window.materialEditorApi?.saveApiConfig) {
      setApiConfigDetail('当前环境未接入专业版 API 配置保存。')
      return
    }

    setIsSavingApiConfig(true)
    try {
      const result = await window.materialEditorApi.saveApiConfig({
        provider,
        baseUrl: apiBaseUrl,
        model,
        apiKey,
      })
      setApiKey('')
      setApiKeyMasked(result.apiKeyMasked || '未配置')
      setApiConfigDetail(result.detail || 'API 配置已保存。')
    } catch {
      setApiConfigDetail('API 配置保存失败，请检查本地目录权限。')
    } finally {
      setIsSavingApiConfig(false)
    }
  }

  return (
    <section className="panel panel-column">
      <header className="panel-header">
        <div>
          <span className="eyebrow">系统配置</span>
          <h2>设置</h2>
        </div>
      </header>
      <div className="settings-grid">
        <article className="setting-card"><strong>API 配置</strong><p>专业版增强能力的服务商、地址、模型与密钥入口。</p></article>
        <article className="setting-card"><strong>标签体系</strong><p>内容、视觉、风格、用途标签标准。</p></article>
        <article className="setting-card"><strong>导出参数</strong><p>分辨率、命名规则、输出目录。</p></article>
      </div>
      <div className="panel secondary-panel panel-column">
        <h3>专业版 API 配置</h3>
        <label className="field-block">
          <span>服务商</span>
          <input value={provider} onChange={event => setProvider(event.target.value)} />
        </label>
        <label className="field-block">
          <span>API 地址</span>
          <input value={apiBaseUrl} onChange={event => setApiBaseUrl(event.target.value)} />
        </label>
        <label className="field-block">
          <span>模型</span>
          <input value={model} onChange={event => setModel(event.target.value)} placeholder="例如 gpt-4o-mini" />
        </label>
        <label className="field-block">
          <span>当前密钥状态</span>
          <input value={apiKeyMasked} readOnly />
        </label>
        <label className="field-block">
          <span>API 密钥</span>
          <input value={apiKey} onChange={event => setApiKey(event.target.value)} placeholder="留空则保留已有密钥，输入新值则覆盖" />
        </label>
        <button onClick={handleSaveApiConfig} disabled={isSavingApiConfig}>{isSavingApiConfig ? '保存中...' : '保存 API 配置'}</button>
        <p>{apiConfigDetail}</p>
      </div>
      <div className="panel secondary-panel">
        <h3>窗口验证</h3>
        <p>可直接抓取当前桌面截图，验证桌面端窗口是否正常显示。</p>
        <button onClick={handleCapture} disabled={isCapturing}>{isCapturing ? '截图中...' : '抓取桌面截图'}</button>
        <p>{captureDetail || '截图会保存到当前软件的导出目录。'}</p>
      </div>
    </section>
  )
}
