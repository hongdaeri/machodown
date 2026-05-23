import { useEffect } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import { useUiStore } from '../../stores/uiStore'

interface SaveDialogResult {
  ok: boolean
  canceled: boolean
  path?: string
}

interface CreateFileResult {
  ok: boolean
  code?: string
  message?: string
}

export function NewFileModal(): null {
  const modal = useUiStore((s) => s.modal)
  const closeModal = useUiStore((s) => s.closeModal)
  const pushToast = useUiStore((s) => s.pushToast)
  const openTab = useEditorStore((s) => s.openTab)

  useEffect(() => {
    let cancelled = false
    const dir = (modal.props?.dir as string | undefined) ?? ''

    const run = async (): Promise<void> => {
      const defaultPath = dir ? `${dir}/untitled.md` : 'untitled.md'
      const dialog = (await window.api.invoke('dialog:saveFile', {
        title: '새 파일 만들기',
        defaultPath
      })) as SaveDialogResult

      if (cancelled) return

      if (!dialog.ok || dialog.canceled || !dialog.path) {
        closeModal()
        return
      }

      const result = (await window.api.invoke('fs:createFile', {
        path: dialog.path
      })) as CreateFileResult

      if (cancelled) return

      if (!result.ok) {
        const message =
          result.code === 'EEXIST'
            ? '이미 존재하는 파일입니다.'
            : `파일을 만들 수 없습니다: ${result.message ?? ''}`
        pushToast({ type: 'error', message })
        closeModal()
        return
      }

      openTab({ path: dialog.path, content: '', encoding: 'utf-8', eol: 'LF', mtime: Date.now() })
      closeModal()
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [closeModal, pushToast, openTab, modal])

  return null
}
