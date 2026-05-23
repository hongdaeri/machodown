import React, { useEffect, useRef } from 'react'
import { useSettingsStore } from './stores/settingsStore'
import { useUiStore } from './stores/uiStore'
import { useWorkspaceStore } from './stores/workspaceStore'
import { useAutoSave } from './hooks/useAutoSave'
import { useMenuListeners } from './hooks/useMenuListeners'
import { useShortcuts } from './hooks/useShortcuts'
import { useResize } from './hooks/useResize'
import { useSessionRestore } from './hooks/useSessionRestore'
import { useRecoveryDetection } from './hooks/useRecoveryDetection'
import { useWorkspaceWatcher } from './hooks/useWorkspaceWatcher'
import { useFileWatcher } from './hooks/useFileWatcher'
import { useUpdater } from './hooks/useUpdater'
import { useTocExtractor } from './hooks/useTocExtractor'
import { TitleBar } from './components/layout/TitleBar'
import { MenuBar } from './components/layout/MenuBar'
import { TabBar } from './components/layout/TabBar'

const IS_MAC = navigator.platform.startsWith('Mac')
import { StatusBar } from './components/layout/StatusBar'
import { Sidebar } from './components/layout/Sidebar'
import { EditorPane } from './components/editor/EditorPane'
import { PreviewPane } from './components/editor/PreviewPane'
import { TocPane } from './components/layout/TocPane'
import { ToastStack } from './components/ui/ToastStack'
import { ModalManager } from './components/modals/ModalManager'

export default function App(): React.ReactElement {
  const theme = useSettingsStore((s) => s.settings.theme)
  const accentColor = useSettingsStore((s) => s.settings.accentColor)
  const viewMode = useUiStore((s) => s.viewMode)
  const sidebarVisible = useUiStore((s) => s.sidebarVisible)

  const editorBodyRef = useRef<HTMLDivElement>(null)
  const resizeHandleRef = useResize(editorBodyRef)

  useMenuListeners()
  useAutoSave()
  useShortcuts()
  useSessionRestore()
  useRecoveryDetection()
  useWorkspaceWatcher()
  useFileWatcher()
  useUpdater()
  useTocExtractor()

  useEffect(() => {
    void useSettingsStore.getState().load()
    void useWorkspaceStore.getState().load()
  }, [])

  useEffect(() => {
    const applyTheme = (dark: boolean): void => {
      const root = document.documentElement
      root.classList.toggle('theme-dark', dark)
      root.classList.toggle('theme-light', !dark)
    }

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mq.matches)
      const handler = (e: MediaQueryListEvent): void => applyTheme(e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    } else {
      applyTheme(theme === 'dark')
    }
    return undefined
  }, [theme])

  useEffect(() => {
    const map: Record<string, [string, string]> = {
      'macho-claude': ['#D97757', 'rgba(217, 119, 87, 0.12)'],
      blue: ['oklch(0.58 0.14 250)', 'oklch(0.58 0.14 250 / 0.12)'],
      purple: ['oklch(0.55 0.16 290)', 'oklch(0.55 0.16 290 / 0.12)'],
      green: ['oklch(0.58 0.16 150)', 'oklch(0.58 0.16 150 / 0.12)'],
      orange: ['oklch(0.68 0.18 50)', 'oklch(0.68 0.18 50 / 0.12)'],
      pink: ['oklch(0.60 0.18 350)', 'oklch(0.60 0.18 350 / 0.12)'],
      teal: ['oklch(0.58 0.14 190)', 'oklch(0.58 0.14 190 / 0.12)']
    }
    const [accent, soft] = map[accentColor] ?? map['macho-claude']
    document.documentElement.style.setProperty('--accent', accent)
    document.documentElement.style.setProperty('--accent-soft', soft)
  }, [accentColor])

  return (
    <div className="window">
      <TitleBar />
      {!IS_MAC && <MenuBar />}
      <TabBar />
      <div className="editor-body" ref={editorBodyRef}>
        {sidebarVisible && <Sidebar />}
        {viewMode !== 'preview' && <EditorPane />}
        {viewMode === 'split' && <div ref={resizeHandleRef} className="resize" />}
        {viewMode !== 'editor' && <PreviewPane />}
        <TocPane />
      </div>
      <StatusBar />
      <ToastStack />
      <ModalManager />
    </div>
  )
}
