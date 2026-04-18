import { useMemo } from 'react'
import { TaskList } from '../components/task-list'
import type { TaskRecord } from '../shared/types/task'

export function TasksPage({ tasks }: { tasks: TaskRecord[] }) {
  const summary = useMemo(() => ({
    running: tasks.filter(task => task.status === 'running').length,
    done: tasks.filter(task => task.status === 'done').length,
    failed: tasks.filter(task => task.status === 'failed').length,
  }), [tasks])

  return (
    <section className="panel panel-column">
      <header className="panel-header">
        <div>
          <span className="eyebrow">任务控制台</span>
          <h2>任务</h2>
        </div>
      </header>
      <div className="tag-row">
        <span>进行中 {summary.running}</span>
        <span>已完成 {summary.done}</span>
        <span>失败 {summary.failed}</span>
      </div>
      <TaskList tasks={tasks} />
    </section>
  )
}
