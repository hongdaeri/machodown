import { useCallback, useEffect, useRef } from 'react'
import Editor, { OnChange, OnMount, BeforeMount } from '@monaco-editor/react'
import type { Monaco } from '@monaco-editor/react'
import type { editor as MonacoEditor } from 'monaco-editor'
import { useEditorStore } from '../../stores/editorStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useUiStore } from '../../stores/uiStore'
import { EmptyState } from '../layout/EmptyState'
import { registerMachodownThemes } from '../../lib/monacoThemes'
import { registerEditorScroll, syncFromEditor } from '../../lib/scrollSync'

type IStandaloneCodeEditor = MonacoEditor.IStandaloneCodeEditor

export function EditorPane(): JSX.Element {
  const tabs = useEditorStore((s) => s.tabs)
  const activeTabId = useEditorStore((s) => s.activeTabId)
  const updateContent = useEditorStore((s) => s.updateContent)
  const settings = useSettingsStore((s) => s.settings)
  const theme = useSettingsStore((s) => s.settings.theme)
  const accentColor = useSettingsStore((s) => s.settings.accentColor)

  const editorWidth = useUiStore((s) => s.editorWidth)
  const viewMode = useUiStore((s) => s.viewMode)
  const setViewMode = useUiStore((s) => s.setViewMode)

  const editorRef = useRef<IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const activeTabIdRef = useRef<string | null>(activeTabId)
  activeTabIdRef.current = activeTabId
  const lastSyncRef = useRef(0)

  const activeTab = tabs.find((t) => t.id === activeTabId)

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && document.documentElement.classList.contains('theme-dark'))
  const monacoTheme = isDark ? 'machodown-dark' : 'machodown-light'

  const accentColorRef = useRef(accentColor)
  accentColorRef.current = accentColor

  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    monacoRef.current = monaco
    registerMachodownThemes(monaco, accentColorRef.current)
  }, [])

  useEffect(() => {
    const monaco = monacoRef.current
    if (!monaco) return
    registerMachodownThemes(monaco, accentColor)
    monaco.editor.setTheme(monacoTheme)
  }, [accentColor, monacoTheme])

  const paneStyle =
    viewMode === 'split' && editorWidth
      ? ({ flex: `0 0 ${editorWidth}px` } as React.CSSProperties)
      : undefined

  useEffect(() => {
    return () => {
      useUiStore.getState().registerRevealLine(null)
    }
  }, [])

  const handleMount: OnMount = useCallback(
    (editorInstance) => {
      editorRef.current = editorInstance

      if (activeTab?.viewState) {
        editorInstance.restoreViewState(activeTab.viewState as MonacoEditor.ICodeEditorViewState)
      }

      useUiStore.getState().registerRevealLine((line) => {
        editorInstance.revealLineInCenter(line)
      })

      registerEditorScroll((ratio) => {
        const maxScroll = editorInstance.getScrollHeight() - editorInstance.getLayoutInfo().height
        if (maxScroll <= 0) return
        editorInstance.setScrollTop(Math.round(ratio * maxScroll))
      })

      editorInstance.onDidChangeCursorPosition((e) => {
        useUiStore.getState().setCursorPosition(e.position.lineNumber, e.position.column)
      })

      editorInstance.onDidScrollChange(() => {
        if (!useSettingsStore.getState().settings.preview.syncScroll) return
        const now = Date.now()
        if (now - lastSyncRef.current < 200) return
        lastSyncRef.current = now
        const maxScroll = editorInstance.getScrollHeight() - editorInstance.getLayoutInfo().height
        if (maxScroll <= 0) return
        syncFromEditor(editorInstance.getScrollTop() / maxScroll)
      })
    },
    [activeTab?.viewState]
  )

  const handleChange: OnChange = useCallback(
    (value) => {
      const id = activeTabIdRef.current
      if (id !== null && value !== undefined) {
        updateContent(id, value)
      }
    },
    [updateContent]
  )

  if (!activeTab) {
    return (
      <div className="editor-pane" style={paneStyle}>
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="editor-pane" style={paneStyle}>
      {viewMode === 'editor' && (
        <div className="preview-toolbar">
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              paddingRight: 6,
              whiteSpace: 'nowrap'
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--success)',
                display: 'inline-block'
              }}
            />
            실시간 동기화
          </span>
          <span className="seg" role="tablist" aria-label="보기 모드">
            <button className="on" aria-pressed={true}>
              편집
            </button>
            <button aria-pressed={false} onClick={() => setViewMode('preview')}>
              프리뷰
            </button>
            <button aria-pressed={false} onClick={() => setViewMode('split')}>
              스플릿
            </button>
          </span>
          <span className="spacer" />
        </div>
      )}
      <Editor
        key={activeTab.id}
        value={activeTab.content}
        language="markdown"
        theme={monacoTheme}
        beforeMount={handleBeforeMount}
        onChange={handleChange}
        onMount={handleMount}
        options={{
          fontSize: settings.editor.fontSize,
          fontFamily: settings.editor.fontFamily,
          tabSize: settings.editor.tabSize,
          wordWrap: settings.editor.wordWrap,
          lineNumbers: settings.editor.lineNumbers,
          minimap: settings.editor.minimap,
          scrollBeyondLastLine: false,
          renderWhitespace: 'boundary',
          bracketPairColorization: { enabled: true }
        }}
      />
    </div>
  )
}
