export type TaskStatus = 'queued' | 'running' | 'done' | 'failed'

export type TaskRecord = {
  id: string
  type: string
  label: string
  status: TaskStatus
  progress: number
  currentStep: string
  currentFile: string | null
  etaSeconds: number | null
  errorMessage: string | null
}
