import { useEffect } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import { useUiStore } from '../../stores/uiStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'

interface TrashResult {
  ok: boolean
  code?: string
  message?: string
}

export function ConfirmDeleteModal(): JSX.Element {
  const modal = useUiStore((s) => s.modal)
  const closeModal = useUiStore((s) => s.closeModal)
  const pushToast = useUiStore((s) => s.pushToast)
  const closeTabByPath = useEditorStore((s) => s.closeTabByPath)

  const filePath = (modal.props?.path as string | undefined) ?? ''
  const name = (modal.props?.name as string | undefined) ?? filePath.split('/').pop() ?? ''

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeModal])

  const handleDelete = async (): Promise<void> => {
    const result = (await window.api.invoke('fs:trash', { path: filePath })) as TrashResult

    if (!result.ok) {
      pushToast({
        type: 'error',
        message: `삭제할 수 없습니다: ${result.message ?? ''}`
      })
      closeModal()
      return
    }

    closeTabByPath(filePath)
    const parentDir = filePath.substring(0, filePath.lastIndexOf('/'))
    void useWorkspaceStore.getState().refreshNode(parentDir)
    closeModal()
  }

  return (
    <div className="modal-scrim" onMouseDown={closeModal}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <h3>삭제</h3>
        <p>
          <strong>{name}</strong>을(를) 휴지통으로 이동하시겠습니까?
        </p>
        <div className="actions">
          <button className="btn" onClick={closeModal}>
            취소
          </button>
          <button className="btn danger" onClick={() => void handleDelete()}>
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}
