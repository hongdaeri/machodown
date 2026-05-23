import { useEffect } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import { useUiStore } from '../../stores/uiStore'
import { Encoding } from '../../stores/types'

const ENCODINGS: { value: Encoding; label: string }[] = [
  { value: 'utf-8', label: 'UTF-8' },
  { value: 'utf-16le', label: 'UTF-16 LE' },
  { value: 'utf-16be', label: 'UTF-16 BE' },
  { value: 'euc-kr', label: 'EUC-KR' }
]

export function EncodingModal(): JSX.Element {
  const modal = useUiStore((s) => s.modal)
  const closeModal = useUiStore((s) => s.closeModal)
  const tabs = useEditorStore((s) => s.tabs)
  const setTabEncoding = useEditorStore((s) => s.setTabEncoding)

  const tabId = (modal.props?.tabId as string | undefined) ?? ''
  const tab = tabs.find((t) => t.id === tabId)
  const current = tab?.encoding ?? 'utf-8'

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeModal])

  const handleSelect = (encoding: Encoding): void => {
    if (tabId) setTabEncoding(tabId, encoding)
    closeModal()
  }

  return (
    <div className="modal-scrim" onMouseDown={closeModal}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <h3>인코딩 변경</h3>
        <div className="picker-list">
          {ENCODINGS.map(({ value, label }) => (
            <button
              key={value}
              className={`picker-row${current === value ? ' selected' : ''}`}
              onClick={() => handleSelect(value)}
            >
              {label}
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
