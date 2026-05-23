import { useEffect, useRef, useState } from 'react'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useUiStore } from '../../stores/uiStore'

interface StatResult {
  ok: boolean
}

interface MkdirResult {
  ok: boolean
  message?: string
}

export function NewFolderModal(): JSX.Element {
  const modal = useUiStore((s) => s.modal)
  const closeModal = useUiStore((s) => s.closeModal)
  const pushToast = useUiStore((s) => s.pushToast)

  const dir = (modal.props?.dir as string | undefined) ?? ''
  const [name, setName] = useState('새 폴더')
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
    if (!trimmed) {
      closeModal()
      return
    }

    const newPath = `${dir}/${trimmed}`
    const stat = (await window.api.invoke('fs:stat', { path: newPath })) as StatResult
    if (stat.ok) {
      setInlineError('같은 이름의 폴더가 이미 존재합니다.')
      inputRef.current?.select()
      return
    }

    const result = (await window.api.invoke('fs:mkdir', { path: newPath })) as MkdirResult
    if (!result.ok) {
      pushToast({ type: 'error', message: `폴더를 만들 수 없습니다: ${result.message ?? ''}` })
      closeModal()
      return
    }

    void useWorkspaceStore.getState().refreshNode(dir)
    closeModal()
  }

  return (
    <div className="modal-scrim" onMouseDown={closeModal}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <h3>새 폴더</h3>
        <div className="field">
          <label>폴더 이름</label>
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
            만들기
          </button>
        </div>
      </div>
    </div>
  )
}
