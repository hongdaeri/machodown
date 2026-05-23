import { useEffect, useState, useCallback } from 'react'
import { useUiStore } from '../../stores/uiStore'
import { useEditorStore } from '../../stores/editorStore'

interface ReadFileResponse {
  ok: boolean
  content?: string
  encoding?: string
  mtime?: number
}

export function MergeModal(): JSX.Element {
  const closeModal = useUiStore((s) => s.closeModal)
  const props = useUiStore((s) => s.modal.props)
  const pushToast = useUiStore((s) => s.pushToast)
  const filePath = (props?.path as string | undefined) ?? ''

  const [diskContent, setDiskContent] = useState<string | null>(null)

  useEffect(() => {
    if (!filePath) return
    void (async () => {
      const res = (await window.api.invoke('fs:readFile', { path: filePath })) as ReadFileResponse
      if (res.ok && res.content !== undefined) {
        setDiskContent(res.content)
      }
    })()
  }, [filePath])

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeModal])

  const handleKeepMine = useCallback(() => {
    closeModal()
  }, [closeModal])

  const handleUseDisk = useCallback(() => {
    const { tabs } = useEditorStore.getState()
    const tab = tabs.find((t) => t.path === filePath)
    if (tab) {
      void useEditorStore.getState().reloadTab(tab.id)
    }
    closeModal()
  }, [filePath, closeModal])

  const handleSaveCopy = useCallback(async () => {
    const { tabs } = useEditorStore.getState()
    const tab = tabs.find((t) => t.path === filePath)
    if (!tab) {
      closeModal()
      return
    }

    const ext = filePath.lastIndexOf('.') !== -1 ? filePath.slice(filePath.lastIndexOf('.')) : ''
    const base = filePath.slice(0, filePath.length - ext.length)
    const copyPath = `${base}.copy${ext}`

    const res = (await window.api.invoke('fs:writeFile', {
      path: copyPath,
      content: tab.content,
      encoding: tab.encoding
    })) as { ok: boolean }

    if (res.ok) {
      pushToast({ type: 'success', message: `사본 저장됨: ${copyPath.split('/').pop()}` })
      void useEditorStore.getState().reloadTab(tab.id)
    } else {
      pushToast({ type: 'error', message: '사본 저장에 실패했습니다.' })
    }
    closeModal()
  }, [filePath, closeModal, pushToast])

  const filename = filePath.split('/').pop() ?? filePath

  return (
    <div className="modal-scrim" onMouseDown={closeModal}>
      <div className="modal merge-modal" onMouseDown={(e) => e.stopPropagation()}>
        <h3>외부 파일 변경 감지</h3>
        <p className="merge-modal__desc">
          <strong>{filename}</strong> 파일이 외부에서 변경되었습니다.
          {diskContent !== null && ' 저장되지 않은 수정 내용이 있습니다.'}
        </p>
        <div className="actions">
          <button className="btn" onClick={handleKeepMine}>
            내 변경 보존
          </button>
          <button className="btn" onClick={handleUseDisk} disabled={diskContent === null}>
            디스크 버전 사용
          </button>
          <button
            className="btn primary"
            onClick={() => void handleSaveCopy()}
            disabled={diskContent === null}
          >
            사본 저장 후 불러오기
          </button>
        </div>
      </div>
    </div>
  )
}
