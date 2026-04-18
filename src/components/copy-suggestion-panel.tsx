type CopySuggestionPanelProps = {
  detail: string
  suggestions: string[]
  actionDetail: string
  isLoading: boolean
  title?: string
  onLoadSuggestions: () => void
  onCopySuggestions: () => void
}

export function CopySuggestionPanel({
  detail,
  suggestions,
  actionDetail,
  isLoading,
  title = '文案建议',
  onLoadSuggestions,
  onCopySuggestions,
}: CopySuggestionPanelProps) {
  return (
    <div className="suggestion-block">
      <div className="status-row">
        <h3>{title}</h3>
        <div className="action-row">
          <button onClick={onLoadSuggestions} disabled={isLoading}>{isLoading ? '获取中...' : '获取文案建议'}</button>
          <button onClick={onCopySuggestions} disabled={!suggestions.length}>复制建议</button>
        </div>
      </div>
      <p>{detail}</p>
      {suggestions.length ? (
        <ul className="suggestion-list">
          {suggestions.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : null}
      {actionDetail ? <p>{actionDetail}</p> : null}
    </div>
  )
}
