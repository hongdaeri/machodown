import { useEditorStore } from '../stores/editorStore'
import { useUiStore } from '../stores/uiStore'
import { openFileAction, saveFileAction, saveAllAction } from '../lib/fileActions'

export interface ShortcutDefinition {
  id: string
  category: string
  label: string
  keys: { mac: string; win: string; linux: string }
  scope: 'global' | 'editor'
  preventDefault: boolean
  action: () => void
}

export const SHORTCUTS: ShortcutDefinition[] = [
  {
    id: 'file.save',
    category: 'File',
    label: '저장',
    keys: { mac: 'Meta+KeyS', win: 'Control+KeyS', linux: 'Control+KeyS' },
    scope: 'global',
    preventDefault: true,
    action: () => {
      const id = useEditorStore.getState().activeTabId
      if (id) void saveFileAction(id)
    }
  },
  {
    id: 'file.saveAll',
    category: 'File',
    label: '모두 저장',
    keys: { mac: 'Meta+Shift+KeyS', win: 'Control+Shift+KeyS', linux: 'Control+Shift+KeyS' },
    scope: 'global',
    preventDefault: true,
    action: () => void saveAllAction()
  },
  {
    id: 'file.new',
    category: 'File',
    label: '새 파일',
    keys: { mac: 'Meta+KeyN', win: 'Control+KeyN', linux: 'Control+KeyN' },
    scope: 'global',
    preventDefault: true,
    action: () => useUiStore.getState().openModal('newFile')
  },
  {
    id: 'file.open',
    category: 'File',
    label: '파일 열기',
    keys: { mac: 'Meta+KeyO', win: 'Control+KeyO', linux: 'Control+KeyO' },
    scope: 'global',
    preventDefault: true,
    action: () => void openFileAction()
  },
  {
    id: 'view.toggleSidebar',
    category: 'View',
    label: '사이드바 토글',
    keys: { mac: 'Meta+KeyB', win: 'Control+KeyB', linux: 'Control+KeyB' },
    scope: 'global',
    preventDefault: true,
    action: () => useUiStore.getState().toggleSidebar()
  },
  {
    id: 'view.togglePreview',
    category: 'View',
    label: '미리보기 토글',
    keys: { mac: 'Meta+Shift+KeyP', win: 'Control+Shift+KeyP', linux: 'Control+Shift+KeyP' },
    scope: 'global',
    preventDefault: true,
    action: () => {
      const { viewMode, setViewMode } = useUiStore.getState()
      setViewMode(viewMode === 'split' ? 'editor' : 'split')
    }
  },
  {
    id: 'help.shortcuts',
    category: 'Help',
    label: '단축키 도움말',
    keys: { mac: 'Meta+Slash', win: 'Control+Slash', linux: 'Control+Slash' },
    scope: 'global',
    preventDefault: true,
    action: () => useUiStore.getState().openModal('shortcuts')
  },
  {
    id: 'view.commandPalette',
    category: 'View',
    label: '명령 팔레트',
    keys: { mac: 'Meta+KeyP', win: 'Control+KeyP', linux: 'Control+KeyP' },
    scope: 'global',
    preventDefault: true,
    action: () => useUiStore.getState().openModal('commandPalette')
  },
  {
    id: 'file.settings',
    category: 'File',
    label: '설정',
    keys: { mac: 'Meta+Comma', win: 'Control+Comma', linux: 'Control+Comma' },
    scope: 'global',
    preventDefault: true,
    action: () => useUiStore.getState().openModal('settings')
  },
  {
    id: 'edit.replace',
    category: 'Edit',
    label: '일괄 바꾸기',
    keys: { mac: 'Meta+Shift+KeyF', win: 'Control+Shift+KeyF', linux: 'Control+Shift+KeyF' },
    scope: 'global',
    preventDefault: true,
    action: () => useUiStore.getState().openModal('replace')
  },
  {
    id: 'view.toggleToc',
    category: 'View',
    label: '목차 토글',
    keys: { mac: 'Meta+Shift+KeyT', win: 'Control+Shift+KeyT', linux: 'Control+Shift+KeyT' },
    scope: 'global',
    preventDefault: true,
    action: () => useUiStore.getState().toggleToc()
  }
]
