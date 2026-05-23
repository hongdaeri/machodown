import { useState, useCallback, useRef, useEffect } from 'react'
import { useEditorStore } from '../../stores/editorStore'
import { useUiStore } from '../../stores/uiStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { SHORTCUTS } from '../../shortcuts/registry'
import { openFileAction, saveFileAction, saveAllAction } from '../../lib/fileActions'
import { MenuDropdown, MenuItemDef } from './MenuDropdown'

const IS_MAC = navigator.platform.startsWith('Mac')

function fmtKey(shortcutId: string): string {
  const sc = SHORTCUTS.find((s) => s.id === shortcutId)
  if (!sc) return ''
  const raw = IS_MAC ? sc.keys.mac : sc.keys.win
  return raw
    .split('+')
    .map((p) => {
      if (p === 'Meta') return '⌘'
      if (p === 'Shift') return IS_MAC ? '⇧' : 'Shift+'
      if (p === 'Alt') return IS_MAC ? '⌥' : 'Alt+'
      if (p === 'Control') return 'Ctrl+'
      if (p.startsWith('Key')) return p.slice(3)
      if (p === 'Slash') return '/'
      return p
    })
    .join('')
}

export function MenuBar(): JSX.Element {
  const [openId, setOpenId] = useState<string | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  const activeTabId = useEditorStore((s) => s.activeTabId)
  const activeTab = useEditorStore((s) => s.tabs.find((t) => t.id === s.activeTabId) ?? null)
  const viewMode = useUiStore((s) => s.viewMode)
  const sidebarVisible = useUiStore((s) => s.sidebarVisible)
  const theme = useSettingsStore((s) => s.settings.theme)
  const updateSettings = useSettingsStore((s) => s.update)
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && document.documentElement.classList.contains('theme-dark'))

  const close = useCallback(() => setOpenId(null), [])

  useEffect(() => {
    if (!openId) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') close()
    }
    const onMouseDown = (e: MouseEvent): void => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) close()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onMouseDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onMouseDown)
    }
  }, [openId, close])

  const buildFileItems = (): MenuItemDef[] => [
    {
      type: 'action',
      label: '새 파일',
      kbd: fmtKey('file.new'),
      action: () => useUiStore.getState().openModal('newFile')
    },
    {
      type: 'action',
      label: '파일 열기...',
      kbd: fmtKey('file.open'),
      action: () => void openFileAction()
    },
    { type: 'sep' },
    {
      type: 'action',
      label: '저장',
      kbd: fmtKey('file.save'),
      disabled: !activeTabId,
      action: () => {
        if (activeTabId) void saveFileAction(activeTabId)
      }
    },
    {
      type: 'action',
      label: '모두 저장',
      kbd: fmtKey('file.saveAll'),
      action: () => void saveAllAction()
    },
    { type: 'sep' },
    {
      type: 'action',
      label: '이름 변경...',
      disabled: !activeTab,
      action: () => {
        if (activeTab) {
          useUiStore.getState().openModal('rename', { path: activeTab.path, name: activeTab.title })
        }
      }
    },
    {
      type: 'action',
      label: '휴지통으로 이동',
      disabled: !activeTab,
      action: () => {
        if (activeTab) {
          useUiStore
            .getState()
            .openModal('confirmDelete', { path: activeTab.path, name: activeTab.title })
        }
      }
    }
  ]

  const buildViewItems = (): MenuItemDef[] => [
    {
      type: 'action',
      label: '사이드바',
      kbd: fmtKey('view.toggleSidebar'),
      checked: sidebarVisible,
      action: () => useUiStore.getState().toggleSidebar()
    },
    { type: 'sep' },
    {
      type: 'action',
      label: '에디터만',
      checked: viewMode === 'editor',
      action: () => useUiStore.getState().setViewMode('editor')
    },
    {
      type: 'action',
      label: '미리보기만',
      checked: viewMode === 'preview',
      action: () => useUiStore.getState().setViewMode('preview')
    },
    {
      type: 'action',
      label: '분할 보기',
      checked: viewMode === 'split',
      kbd: fmtKey('view.togglePreview'),
      action: () => useUiStore.getState().setViewMode('split')
    }
  ]

  const buildHelpItems = (): MenuItemDef[] => [
    {
      type: 'action',
      label: '단축키',
      kbd: fmtKey('help.shortcuts'),
      action: () => useUiStore.getState().openModal('shortcuts')
    }
  ]

  const menus = [
    { id: 'file', label: '파일', buildItems: buildFileItems },
    { id: 'view', label: '보기', buildItems: buildViewItems },
    { id: 'help', label: '도움말', buildItems: buildHelpItems }
  ]

  return (
    <div ref={barRef} className="menubar">
      {menus.map((menu) => (
        <div
          key={menu.id}
          className={`menu-item${openId === menu.id ? ' open' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault()
            setOpenId(openId === menu.id ? null : menu.id)
          }}
          onMouseEnter={() => {
            if (openId !== null && openId !== menu.id) setOpenId(menu.id)
          }}
        >
          {menu.label}
          {openId === menu.id && <MenuDropdown items={menu.buildItems()} onClose={close} />}
        </div>
      ))}
      <div className="menubar-spacer" />
      <button
        className="menubar-action"
        aria-label="명령어 팔레트"
        title="⌘P"
        onClick={() => useUiStore.getState().openModal('shortcuts')}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.2" />
          <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
      <button
        className="menubar-action"
        aria-label="분할 보기"
        title="분할"
        onClick={() => useUiStore.getState().setViewMode(viewMode === 'split' ? 'editor' : 'split')}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="2" width="5" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <rect x="8" y="2" width="5" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>
      <button
        className="menubar-action"
        aria-label="테마 전환"
        title="테마"
        onClick={() => void updateSettings({ theme: isDark ? 'light' : 'dark' })}
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
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M7 1.5v1M7 11.5v1M1.5 7h1M11.5 7h1M3.05 3.05l.7.7M10.25 10.25l.7.7M10.95 3.05l-.7.7M3.75 10.25l-.7.7"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  )
}
