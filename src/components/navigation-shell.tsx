export function NavigationShell({
  activeTab,
  onChange,
}: {
  activeTab: 'library' | 'generate' | 'version' | 'tasks' | 'settings'
  onChange: (tab: 'library' | 'generate' | 'version' | 'tasks' | 'settings') => void
}) {
  const items: Array<{ key: 'library' | 'generate' | 'version' | 'tasks' | 'settings'; label: string }> = [
    { key: 'library', label: '素材库' },
    { key: 'generate', label: '生成' },
    { key: 'version', label: '版本' },
    { key: 'tasks', label: '任务' },
    { key: 'settings', label: '设置' },
  ]

  return (
    <aside className="sidebar">
      <h1>素材分类剪辑软件</h1>
      <nav>
        {items.map(item => (
          <button key={item.key} className={activeTab === item.key ? 'active' : ''} onClick={() => onChange(item.key)}>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
