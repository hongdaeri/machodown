import { useCallback } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import { useUiStore } from '../../stores/uiStore'
import { useSettingsStore } from '../../stores/settingsStore'

const IS_MAC = navigator.platform.startsWith('Mac')

export function TitleBar(): JSX.Element {
  const tabs = useEditorStore((s) => s.tabs)
  const activeTabId = useEditorStore((s) => s.activeTabId)
  const activeTab = tabs.find((t) => t.id === activeTabId)
  const viewMode = useUiStore((s) => s.viewMode)
  const sidebarVisible = useUiStore((s) => s.sidebarVisible)
  const tocVisible = useUiStore((s) => s.tocVisible)
  const theme = useSettingsStore((s) => s.settings.theme)
  const updateSettings = useSettingsStore((s) => s.update)
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && document.documentElement.classList.contains('theme-dark'))

  const toggleTheme = useCallback(() => {
    void updateSettings({ theme: isDark ? 'light' : 'dark' })
  }, [isDark, updateSettings])

  return (
    <div className="titlebar" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      {IS_MAC ? (
        <div className="traffic-spacer" />
      ) : (
        <div
          className="traffic"
          aria-hidden="true"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <div className="tl-dot tl-close" />
          <div className="tl-dot tl-min" />
          <div className="tl-dot tl-max" />
        </div>
      )}
      <div className="title-center">
        {activeTab ? (
          <>
            <span style={{ color: 'var(--fg-tertiary)' }}>Machodown — </span>
            {activeTab.path.includes('/') && (
              <span style={{ color: 'var(--fg-tertiary)' }}>
                {activeTab.path.slice(0, activeTab.path.lastIndexOf('/') + 1)}
              </span>
            )}
            {activeTab.title}
            {activeTab.isDirty && (
              <span className="dot-unsaved" aria-label="저장되지 않은 변경 사항" />
            )}
          </>
        ) : (
          'Machodown'
        )}
      </div>
      {IS_MAC && (
        <div
          className="titlebar-actions"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            className="menubar-action"
            aria-label="사이드바 토글"
            title="사이드바"
            onClick={() => useUiStore.getState().toggleSidebar()}
            style={{ opacity: sidebarVisible ? 1 : 0.45 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect
                x="1"
                y="2"
                width="12"
                height="10"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path d="M5 2v10" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
          <button
            className="menubar-action"
            aria-label="아웃라인 토글"
            title="아웃라인"
            onClick={() => useUiStore.getState().toggleToc()}
            style={{ opacity: tocVisible ? 1 : 0.45 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3.5h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M5 6h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M5 8.5h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M3 11h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            className="menubar-action"
            aria-label="분할 보기"
            title="분할"
            onClick={() =>
              useUiStore.getState().setViewMode(viewMode === 'split' ? 'editor' : 'split')
            }
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect
                x="1"
                y="2"
                width="5"
                height="10"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <rect
                x="8"
                y="2"
                width="5"
                height="10"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
          </button>
          <button
            className="menubar-action"
            aria-label="테마 전환"
            title="테마"
            onClick={toggleTheme}
          >
            {isDark ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                <path
                  d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.93 2.93l1.06 1.06M10.01 10.01l1.06 1.06M10.01 3.99l1.06-1.06M2.93 11.07l1.06-1.06"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M11.5 7.8A5 5 0 016.2 2.5a5 5 0 100 9 5 5 0 005.3-3.7z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            )}
          </button>
          <button
            className="menubar-action"
            aria-label="설정"
            title="설정"
            onClick={() => useUiStore.getState().openModal('settings')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
