import { useEffect } from 'react'
import { useUiStore } from '../../stores/uiStore'
import { SHORTCUTS } from '../../shortcuts/registry'

const isMac = navigator.platform.startsWith('Mac')

function formatKey(raw: string): string {
  return raw
    .replace('Meta+', '⌘')
    .replace('Control+', 'Ctrl+')
    .replace('Shift+', '⇧')
    .replace('Alt+', '⌥')
    .replace('Key', '')
    .replace('Digit', '')
    .replace('Slash', '/')
    .replace('Period', '.')
    .replace('Comma', ',')
    .replace('Backspace', '⌫')
    .replace('Enter', '↵')
    .replace('Escape', 'Esc')
    .replace('ArrowUp', '↑')
    .replace('ArrowDown', '↓')
    .replace('ArrowLeft', '←')
    .replace('ArrowRight', '→')
}

interface ShortcutGroup {
  category: string
  items: { label: string; key: string }[]
}

function groupShortcuts(): ShortcutGroup[] {
  const map = new Map<string, { label: string; key: string }[]>()
  for (const s of SHORTCUTS) {
    const rawKey = isMac ? s.keys.mac : s.keys.win
    const items = map.get(s.category) ?? []
    items.push({ label: s.label, key: formatKey(rawKey) })
    map.set(s.category, items)
  }
  return Array.from(map.entries()).map(([category, items]) => ({ category, items }))
}

const GROUPS = groupShortcuts()

export function ShortcutsModal(): JSX.Element {
  const closeModal = useUiStore((s) => s.closeModal)

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeModal])

  return (
    <div className="modal-scrim" onMouseDown={closeModal}>
      <div className="modal shortcuts-modal" onMouseDown={(e) => e.stopPropagation()}>
        <h3>키보드 단축키</h3>
        <div className="shortcuts-groups">
          {GROUPS.map((group) => (
            <div key={group.category} className="shortcuts-group">
              <div className="shortcuts-group__title">{group.category}</div>
              {group.items.map((item) => (
                <div key={item.label} className="shortcuts-row">
                  <span className="shortcuts-row__label">{item.label}</span>
                  <kbd className="shortcuts-row__kbd">{item.key}</kbd>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="actions">
          <button className="btn" onClick={closeModal}>
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
