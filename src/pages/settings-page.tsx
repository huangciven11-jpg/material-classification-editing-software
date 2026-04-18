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
  const [configReady, setConfigReady] = useState(false)

  useEffect(() => {
    let disposed = false

    async function loadApiConfig() {
      if (!window.materialEditorApi?.getApiConfig) {
        setApiConfigDetail('当前环境未接入专业版配置读取。')
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
        setConfigReady(Boolean(result.baseUrl && result.model && result.hasApiKey))
        setApiConfigDetail(result.detail || '已读取当前生效配置。')
      } catch {
        if (disposed) {
          return
        }

        setApiConfigDetail('获取失败，请检查本地配置状态。')
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
      setApiConfigDetail('当前环境未接入专业版配置保存。')
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
      setConfigReady(Boolean(result.baseUrl && result.model && result.hasApiKey))
      setApiConfigDetail(
        `当前生效配置：${result.provider} / ${result.baseUrl} / ${result.model} / ${result.hasApiKey ? '已配置密钥' : '未配置密钥'}`
      )
    } catch {
      setApiConfigDetail('保存失败，请检查本地目录权限。')
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
        <div className="status-row">
          <h3>专业版 API 配置</h3>
          <span className={`task-status-badge ${configReady ? 'done' : 'queued'}`}>
            {configReady ? '已配置' : '未配置'}
          </span>
        </div>

        <label className="field-block">
          <span>服务商</span>
          <input value={provider} onChange={event => setProvider(event.target.value)} />
          <small className="field-help">当前优先支持 OpenAI 兼容接口。</small>
        </label>

        <label className="field-block">
          <span>API 地址</span>
          <input value={apiBaseUrl} onChange={event => setApiBaseUrl(event.target.value)} />
          <small className="field-help">例如 https://api.example.com/v1</small>
        </label>

        <label className="field-block">
          <span>模型</span>
          <input value={model} onChange={event => setModel(event.target.value)} placeholder="例如 gpt-4o-mini" />
          <small className="field-help">当前文案建议和标签增强都会使用这个模型。</small>
        </label>

        <label className="field-block">
          <span>当前密钥状态</span>
          <input value={apiKeyMasked} readOnly />
          <small className="field-help">不会在界面中完整显示已有密钥。</small>
        </label>

        <label className="field-block">
          <span>API 密钥</span>
          <input value={apiKey} onChange={event => setApiKey(event.target.value)} placeholder="留空则保留已有密钥，输入新值则覆盖" />
          <small className="field-help">留空保存时会保留已有密钥。</small>
        </label>

        <button onClick={handleSaveApiConfig} disabled={isSavingApiConfig}>{isSavingApiConfig ? '保存中...' : '保存专业版配置'}</button>

        <div className="panel secondary-panel">
          <h3>当前生效配置</h3>
          <p>服务商：{provider || '未设置'}</p>
          <p>API 地址：{apiBaseUrl || '未设置'}</p>
          <p>模型：{model || '未设置'}</p>
          <p>密钥状态：{apiKeyMasked || '未配置'}</p>
        </div>

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
