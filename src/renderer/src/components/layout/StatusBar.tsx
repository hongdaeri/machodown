import { useEditorStore } from '../../stores/editorStore'
import { useUiStore } from '../../stores/uiStore'
import { useSettingsStore } from '../../stores/settingsStore'

export function StatusBar(): JSX.Element {
  const tabs = useEditorStore((s) => s.tabs)
  const activeTabId = useEditorStore((s) => s.activeTabId)
  const cursorLine = useUiStore((s) => s.cursorLine)
  const cursorCol = useUiStore((s) => s.cursorCol)
  const autoSave = useSettingsStore((s) => s.settings.editor.autoSave.enabled)
  const tabSize = useSettingsStore((s) => s.settings.editor.tabSize)
  const activeTab = tabs.find((t) => t.id === activeTabId)

  if (!activeTab) {
    return (
      <div className="statusbar" role="status" aria-live="polite">
        <span className="item">Machodown</span>
      </div>
    )
  }

  const totalLines = activeTab.content.split('\n').length

  return (
    <div className="statusbar" role="status" aria-live="polite">
      <span className="item">{activeTab.isDirty ? '● 저장되지 않음' : '✓ 저장됨'}</span>
      {autoSave && <span className="item">자동 저장 켜짐</span>}
      <span className="grow" />
      <span className="item">
        줄 {cursorLine}, 칸 {cursorCol}
      </span>
      <span className="item">{totalLines} 줄</span>
      <span className="item">공백 {tabSize}</span>
      <span className="item">{activeTab.encoding.toUpperCase()}</span>
      <span className="item">{activeTab.eol}</span>
      <span className="item">Markdown</span>
    </div>
  )
}
