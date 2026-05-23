type Driver = 'editor' | 'preview'

let driver: Driver | null = null
let driverTimer: ReturnType<typeof setTimeout> | null = null

const LOCK_MS = 150

function tryLock(source: Driver): boolean {
  if (driver !== null && driver !== source) return false
  driver = source
  if (driverTimer !== null) clearTimeout(driverTimer)
  driverTimer = setTimeout(() => {
    driver = null
  }, LOCK_MS)
  return true
}

let _scrollEditor: (ratio: number) => void = () => {}
let _scrollPreview: (ratio: number) => void = () => {}

export function registerEditorScroll(fn: (ratio: number) => void): void {
  _scrollEditor = fn
}

export function registerPreviewScroll(fn: (ratio: number) => void): void {
  _scrollPreview = fn
}

export function syncFromEditor(ratio: number): void {
  if (!tryLock('editor')) return
  _scrollPreview(ratio)
}

export function syncFromPreview(ratio: number): void {
  if (!tryLock('preview')) return
  _scrollEditor(ratio)
}
