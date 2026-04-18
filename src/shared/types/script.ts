export type ScriptSegment = {
  id: string
  index: number
  text: string
  intentType: 'problem' | 'detail' | 'demo' | 'result'
  targetDurationMs: number
  locked: boolean
}
