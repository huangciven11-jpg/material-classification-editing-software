import type { TaskRecord } from '../shared/types/task'

function statusLabel(status: TaskRecord['status']) {
  if (status === 'queued') return '排队中'
  if (status === 'running') return '进行中'
  if (status === 'done') return '已完成'
  return '失败'
}

export function TaskList({ tasks }: { tasks: TaskRecord[] }) {
  return (
    <div className="task-list">
      {tasks.map(task => (
        <article key={task.id} className="task-card">
          <div className="segment-head">
            <strong>{task.label}</strong>
            <span className={`task-status-badge ${task.status}`}>{statusLabel(task.status)}</span>
          </div>
          <p>{task.currentStep}</p>
          <span>{task.currentFile ?? '未处理到具体文件'}</span>
          <span>预计剩余：{task.etaSeconds ?? '未知'} 秒</span>
          {task.errorMessage ? <span>错误：{task.errorMessage}</span> : null}
          <div className="progress"><div style={{ width: `${task.progress}%` }} /></div>
        </article>
      ))}
    </div>
  )
}
