import { useEffect } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useUiStore } from '../stores/uiStore'
import { openFileAction, openFolderAction, saveFileAction, saveAllAction } from '../lib/fileActions'

export function useMenuListeners(): void {
  useEffect(() => {
    const offNewFile = window.api.on('menu:newFile', () => {
      useUiStore.getState().openModal('newFile')
    })

    const offOpenFile = window.api.on('menu:openFile', () => {
      void openFileAction()
    })

    const offOpenFolder = window.api.on('menu:openFolder', () => {
      void openFolderAction()
    })

    const offSave = window.api.on('menu:save', () => {
      const id = useEditorStore.getState().activeTabId
      if (id) void saveFileAction(id)
    })

    const offToggleSidebar = window.api.on('menu:toggleSidebar', () => {
      useUiStore.getState().toggleSidebar()
    })

    const offTogglePreview = window.api.on('menu:togglePreview', () => {
      const { viewMode, setViewMode } = useUiStore.getState()
      setViewMode(viewMode === 'split' ? 'editor' : 'split')
    })

    const offSaveAll = window.api.on('menu:saveAll', () => {
      void saveAllAction()
    })

    const offShortcuts = window.api.on('menu:shortcuts', () => {
      useUiStore.getState().openModal('shortcuts')
    })

    const offCloseTab = window.api.on('menu:closeTab', () => {
      const { activeTabId, closeTab } = useEditorStore.getState()
      if (activeTabId) void closeTab(activeTabId)
    })

    const offSettings = window.api.on('menu:settings', () => {
      useUiStore.getState().openModal('settings')
    })

    return () => {
      offNewFile()
      offOpenFile()
      offOpenFolder()
      offSave()
      offToggleSidebar()
      offTogglePreview()
      offSaveAll()
      offShortcuts()
      offCloseTab()
      offSettings()
    }
  }, [])
}
