import { useEffect } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useUiStore } from '../stores/uiStore'
import { consumeSelfSaved } from '../lib/selfSaveRegistry'

export function useFileWatcher(): void {
  useEffect(() => {
    const off = window.api.on('watch:changed', (...args: unknown[]) => {
      const payload = args[0] as { path: string }
      const { path } = payload
      if (consumeSelfSaved(path)) return
      const { tabs } = useEditorStore.getState()
      const tab = tabs.find((t) => t.path === path)
      if (!tab) return

      if (!tab.isDirty) {
        void useEditorStore.getState().reloadTab(tab.id)
      } else {
        useUiStore.getState().openModal('merge', { path })
      }
    })
    return off
  }, [])
}
