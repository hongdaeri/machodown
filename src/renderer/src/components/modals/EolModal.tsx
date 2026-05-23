import { useEffect } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import { useUiStore } from '../../stores/uiStore'
import { EOL } from '../../stores/types'

const EOLS: { value: EOL; label: string; description: string }[] = [
  { value: 'LF', label: 'LF', description: 'Unix / macOS (\\n)' },
  { value: 'CRLF', label: 'CRLF', description: 'Windows (\\r\\n)' }
]

export function EolModal(): JSX.Element {
  const modal = useUiStore((s) => s.modal)
  const closeModal = useUiStore((s) => s.closeModal)
  const tabs = useEditorStore((s) => s.tabs)
  const setTabEol = useEditorStore((s) => s.setTabEol)

  const tabId = (modal.props?.tabId as string | undefined) ?? ''
  const tab = tabs.find((t) => t.id === tabId)
  const current = tab?.eol ?? 'LF'

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeModal])

  const handleSelect = (eol: EOL): void => {
    if (tabId) setTabEol(tabId, eol)
    closeModal()
  }

  return (
    <div className="modal-scrim" onMouseDown={closeModal}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <h3>줄 끝 변경</h3>
        <div className="picker-list">
          {EOLS.map(({ value, label, description }) => (
            <button
              key={value}
              className={`picker-row${current === value ? ' selected' : ''}`}
              onClick={() => handleSelect(value)}
            >
              <span className="picker-label">{label}</span>
              <span className="picker-desc">{description}</span>
              {current === value && <span className="picker-check">✓</span>}
            </button>
          ))}
        </div>
        <div className="actions">
          <button className="btn" onClick={closeModal}>
            취소
          </button>
        </div>
      </div>
    </div>
  )
}
