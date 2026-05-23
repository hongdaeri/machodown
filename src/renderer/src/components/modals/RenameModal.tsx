import { useEffect, useRef, useState } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import { useUiStore } from '../../stores/uiStore'

interface RenameResult {
  ok: boolean
  code?: string
  message?: string
}

export function RenameModal(): JSX.Element {
  const modal = useUiStore((s) => s.modal)
  const closeModal = useUiStore((s) => s.closeModal)
  const pushToast = useUiStore((s) => s.pushToast)
  const renameTab = useEditorStore((s) => s.renameTab)

  const filePath = (modal.props?.path as string | undefined) ?? ''
  const currentName = filePath.split('/').pop() ?? ''
  const dir = filePath.slice(0, filePath.length - currentName.length)

  const [name, setName] = useState(currentName)
  const [inlineError, setInlineError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.select()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeModal])

  const handleConfirm = async (): Promise<void> => {
    const trimmed = name.trim()
    if (!trimmed || trimmed === currentName) {
      closeModal()
      return
    }

    const newPath = `${dir}${trimmed}`
    const result = (await window.api.invoke('fs:rename', {
      oldPath: filePath,
      newPath
    })) as RenameResult

    if (!result.ok) {
      if (result.code === 'EEXIST') {
        setInlineError('같은 이름의 파일이 이미 존재합니다.')
        inputRef.current?.select()
        return
      }
      pushToast({ type: 'error', message: `이름을 변경할 수 없습니다: ${result.message ?? ''}` })
      closeModal()
      return
    }

    renameTab(filePath, newPath)
    closeModal()
  }

  return (
    <div className="modal-scrim" onMouseDown={closeModal}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <h3>이름 변경</h3>
        <div className="field">
          <label>새 이름</label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            aria-invalid={inlineError !== null}
            onChange={(e) => {
              setName(e.target.value)
              if (inlineError) setInlineError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleConfirm()
            }}
          />
          {inlineError && <p className="field-error">{inlineError}</p>}
        </div>
        <div className="actions">
          <button className="btn" onClick={closeModal}>
            취소
          </button>
          <button className="btn primary" onClick={() => void handleConfirm()}>
            변경
          </button>
        </div>
      </div>
    </div>
  )
}
