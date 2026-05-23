import { useEffect, useRef } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useUiStore } from '../stores/uiStore'

const AUTOSAVE_DELAY_MS = 500

export function useAutoSave(): void {
  const activeTabId = useEditorStore((s) => s.activeTabId)
  const content = useEditorStore((s) => s.tabs.find((t) => t.id === s.activeTabId)?.content)
  const isDirty = useEditorStore(
    (s) => s.tabs.find((t) => t.id === s.activeTabId)?.isDirty ?? false
  )
  const saveTab = useEditorStore((s) => s.saveTab)
  const pushToast = useUiStore((s) => s.pushToast)

  const idRef = useRef(activeTabId)
  idRef.current = activeTabId

  useEffect(() => {
    if (!activeTabId || !isDirty) return

    const timer = setTimeout(async () => {
      const id = idRef.current
      if (!id) return
      try {
        await saveTab(id)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('ENOENT')) {
          pushToast({ type: 'error', message: '파일이 외부에서 삭제되었습니다.' })
        } else if (msg.includes('EACCES')) {
          pushToast({ type: 'error', message: '파일에 쓸 권한이 없습니다.' })
        } else if (msg.includes('ENOSPC')) {
          pushToast({ type: 'error', message: '디스크 공간이 부족합니다.' })
        } else {
          pushToast({ type: 'error', message: '자동 저장에 실패했습니다.' })
        }
      }
    }, AUTOSAVE_DELAY_MS)

    return () => clearTimeout(timer)
  }, [activeTabId, content, isDirty, saveTab, pushToast])
}
