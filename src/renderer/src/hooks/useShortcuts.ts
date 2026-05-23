import { useEffect } from 'react'
import { SHORTCUTS } from '../shortcuts/registry'

type Scope = 'global' | 'editor'

function getPlatform(): 'mac' | 'win' | 'linux' {
  const p = navigator.platform.toLowerCase()
  if (p.includes('mac')) return 'mac'
  if (p.includes('win')) return 'win'
  return 'linux'
}

function keysMatch(e: KeyboardEvent, combo: string): boolean {
  const parts = combo.split('+')
  const key = parts[parts.length - 1]
  const mods = parts.slice(0, -1)

  if (e.code !== key) return false
  const needMeta = mods.includes('Meta')
  const needCtrl = mods.includes('Control')
  const needShift = mods.includes('Shift')
  const needAlt = mods.includes('Alt')

  return (
    e.metaKey === needMeta &&
    e.ctrlKey === needCtrl &&
    e.shiftKey === needShift &&
    e.altKey === needAlt
  )
}

export function useShortcuts(scope: Scope = 'global'): void {
  useEffect(() => {
    const platform = getPlatform()

    const handler = (e: KeyboardEvent): void => {
      for (const shortcut of SHORTCUTS) {
        if (shortcut.scope !== scope && shortcut.scope !== 'global') continue
        const combo = shortcut.keys[platform]
        if (keysMatch(e, combo)) {
          if (shortcut.preventDefault) e.preventDefault()
          shortcut.action()
          break
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [scope])
}
