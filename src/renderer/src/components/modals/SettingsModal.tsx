import React, { useState } from 'react'
import { useUiStore } from '../../stores/uiStore'
import { useSettingsStore, AppSettings } from '../../stores/settingsStore'

type SettingsTab = 'appearance' | 'editor' | 'preview'

const ACCENT_COLORS = [
  { key: 'macho-claude', label: 'Macho Claude' },
  { key: 'blue', label: 'Macho Blue' },
  { key: 'purple', label: 'Macho Purple' },
  { key: 'green', label: 'Macho Green' },
  { key: 'orange', label: 'Macho Orange' },
  { key: 'pink', label: 'Macho Pink' },
  { key: 'teal', label: 'Macho Teal' }
] as const

export function SettingsModal(): React.ReactElement {
  const closeModal = useUiStore((s) => s.closeModal)
  const settings = useSettingsStore((s) => s.settings)
  const updateSettings = useSettingsStore((s) => s.update)
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance')

  const update = (patch: Partial<AppSettings>): void => {
    void updateSettings(patch)
  }

  const updateEditor = (patch: Partial<AppSettings['editor']>): void => {
    void updateSettings({ editor: { ...settings.editor, ...patch } })
  }

  const updatePreview = (patch: Partial<AppSettings['preview']>): void => {
    void updateSettings({ preview: { ...settings.preview, ...patch } })
  }

  return (
    <div className="modal-scrim" onClick={closeModal}>
      <div className="settings-modal modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal__header">
          <h3>설정</h3>
          <button className="icon-btn" onClick={closeModal}>
            ✕
          </button>
        </div>
        <div className="settings-modal__tabs">
          <button
            className={`settings-tab${activeTab === 'appearance' ? ' active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            외관
          </button>
          <button
            className={`settings-tab${activeTab === 'editor' ? ' active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            에디터
          </button>
          <button
            className={`settings-tab${activeTab === 'preview' ? ' active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            미리보기
          </button>
        </div>
        <div className="settings-modal__body">
          {activeTab === 'appearance' && (
            <>
              <div className="settings-section">
                <label className="settings-label">테마</label>
                <select
                  className="settings-select"
                  value={settings.theme}
                  onChange={(e) => update({ theme: e.target.value as AppSettings['theme'] })}
                >
                  <option value="system">시스템</option>
                  <option value="light">라이트</option>
                  <option value="dark">다크</option>
                </select>
              </div>
              <div className="settings-section">
                <label className="settings-label">포인트 색상</label>
                <select
                  className="settings-select"
                  value={settings.accentColor}
                  onChange={(e) =>
                    update({ accentColor: e.target.value as AppSettings['accentColor'] })
                  }
                >
                  {ACCENT_COLORS.map(({ key, label }) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="settings-section">
                <label className="settings-label">에디터 폰트</label>
                <select
                  className="settings-select"
                  value={settings.editor.fontFamily}
                  onChange={(e) => updateEditor({ fontFamily: e.target.value })}
                >
                  <option value="JetBrains Mono, Menlo, Monaco, monospace">JetBrains Mono</option>
                  <option value="'Fira Code', Menlo, Monaco, monospace">Fira Code</option>
                  <option value="'SF Mono', Menlo, Monaco, monospace">SF Mono</option>
                  <option value="Menlo, Monaco, monospace">Menlo</option>
                  <option value="Monaco, Menlo, monospace">Monaco</option>
                  <option value="Consolas, 'Courier New', monospace">Consolas</option>
                  <option value="ui-monospace, monospace">시스템 모노</option>
                </select>
              </div>
            </>
          )}
          {activeTab === 'editor' && (
            <>
              <div className="settings-section">
                <label className="settings-label">폰트 크기</label>
                <div className="settings-row">
                  <input
                    type="range"
                    min={8}
                    max={36}
                    value={settings.editor.fontSize}
                    onChange={(e) => updateEditor({ fontSize: parseInt(e.target.value, 10) })}
                  />
                  <span className="settings-value">{settings.editor.fontSize}px</span>
                </div>
              </div>
              <div className="settings-section">
                <label className="settings-label">탭 크기</label>
                <select
                  className="settings-select"
                  value={settings.editor.tabSize}
                  onChange={(e) => updateEditor({ tabSize: parseInt(e.target.value, 10) })}
                >
                  <option value={2}>2</option>
                  <option value={4}>4</option>
                </select>
              </div>
              <div className="settings-section">
                <label className="settings-label">줄 바꿈</label>
                <select
                  className="settings-select"
                  value={settings.editor.wordWrap}
                  onChange={(e) =>
                    updateEditor({ wordWrap: e.target.value as AppSettings['editor']['wordWrap'] })
                  }
                >
                  <option value="on">켜짐</option>
                  <option value="off">꺼짐</option>
                </select>
              </div>
              <div className="settings-section settings-section--row">
                <label className="settings-label">줄 번호</label>
                <input
                  type="checkbox"
                  checked={settings.editor.lineNumbers === 'on'}
                  onChange={(e) => updateEditor({ lineNumbers: e.target.checked ? 'on' : 'off' })}
                />
              </div>
              <div className="settings-section settings-section--row">
                <label className="settings-label">미니맵</label>
                <input
                  type="checkbox"
                  checked={settings.editor.minimap.enabled}
                  onChange={(e) => updateEditor({ minimap: { enabled: e.target.checked } })}
                />
              </div>
              <div className="settings-section settings-section--row">
                <label className="settings-label">자동 저장</label>
                <input
                  type="checkbox"
                  checked={settings.editor.autoSave.enabled}
                  onChange={(e) =>
                    updateEditor({
                      autoSave: { ...settings.editor.autoSave, enabled: e.target.checked }
                    })
                  }
                />
              </div>
            </>
          )}
          {activeTab === 'preview' && (
            <>
              <div className="settings-section settings-section--row">
                <label className="settings-label">스크롤 동기화</label>
                <input
                  type="checkbox"
                  checked={settings.preview.syncScroll}
                  onChange={(e) => updatePreview({ syncScroll: e.target.checked })}
                />
              </div>
              <div className="settings-section settings-section--row">
                <label className="settings-label">KaTeX 수식 렌더링</label>
                <input
                  type="checkbox"
                  checked={settings.preview.katex}
                  onChange={(e) => updatePreview({ katex: e.target.checked })}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
