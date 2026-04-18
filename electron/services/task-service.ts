import crypto from 'node:crypto'
import type { TaskRecord } from '../../src/shared/types/task.js'
import { getDb } from './db.js'

type TaskRow = {
  id: string
  type: string
  label: string
  status: TaskRecord['status']
  progress: number
  current_step: string
  current_file: string | null
  eta_seconds: number | null
  error_message: string | null
}

export function createTaskService() {
  const db = getDb()

  const insertTask = db.prepare(`
    INSERT INTO tasks (id, type, label, status, progress, current_step, current_file, eta_seconds, error_message, created_at)
    VALUES (@id, @type, @label, @status, @progress, @current_step, @current_file, @eta_seconds, @error_message, @created_at)
  `)

  const updateTask = db.prepare(`
    UPDATE tasks
    SET status = @status,
        progress = @progress,
        current_step = @current_step,
        current_file = @current_file,
        eta_seconds = @eta_seconds,
        error_message = @error_message
    WHERE id = @id
  `)

  const selectTasks = db.prepare<[], TaskRow>(`
    SELECT id, type, label, status, progress, current_step, current_file, eta_seconds, error_message
    FROM tasks
    ORDER BY created_at DESC
  `)

  return {
    createTask(input: { type: string; label: string; currentStep?: string }) {
      const task: TaskRecord = {
        id: crypto.randomUUID(),
        type: input.type,
        label: input.label,
        status: 'queued',
        progress: 0,
        currentStep: input.currentStep ?? '等待开始',
        currentFile: null,
        etaSeconds: null,
        errorMessage: null,
      }

      insertTask.run({
        id: task.id,
        type: task.type,
        label: task.label,
        status: task.status,
        progress: task.progress,
        current_step: task.currentStep,
        current_file: task.currentFile,
        eta_seconds: task.etaSeconds,
        error_message: task.errorMessage,
        created_at: new Date().toISOString(),
      })

      return task
    },
    updateTask(taskId: string, patch: Partial<Pick<TaskRecord, 'status' | 'progress' | 'currentStep' | 'currentFile' | 'etaSeconds' | 'errorMessage'>>) {
      const existing = selectTasks.all().find(task => task.id === taskId)
      if (!existing) {
        return null
      }

      updateTask.run({
        id: taskId,
        status: patch.status ?? existing.status,
        progress: patch.progress ?? existing.progress,
        current_step: patch.currentStep ?? existing.current_step,
        current_file: patch.currentFile ?? existing.current_file,
        eta_seconds: patch.etaSeconds ?? existing.eta_seconds,
        error_message: patch.errorMessage ?? existing.error_message,
      })

      return taskId
    },
    listTasks(): TaskRecord[] {
      return selectTasks.all().map((row: TaskRow) => ({
        id: String(row.id),
        type: String(row.type),
        label: String(row.label),
        status: row.status,
        progress: Number(row.progress),
        currentStep: String(row.current_step),
        currentFile: row.current_file ? String(row.current_file) : null,
        etaSeconds: typeof row.eta_seconds === 'number' ? row.eta_seconds : null,
        errorMessage: row.error_message ? String(row.error_message) : null,
      }))
    },
  }
}
