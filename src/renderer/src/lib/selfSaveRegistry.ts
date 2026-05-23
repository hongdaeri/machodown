const registry = new Map<string, number>()
const TTL_MS = 2000

export function markSelfSaved(path: string): void {
  registry.set(path, Date.now())
}

export function consumeSelfSaved(path: string): boolean {
  const ts = registry.get(path)
  if (ts === undefined) return false
  registry.delete(path)
  return Date.now() - ts < TTL_MS
}
