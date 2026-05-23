import { create } from 'zustand'
import { Tab, Encoding, EOL } from './types'
import { markSelfSaved } from '../lib/selfSaveRegistry'

let tabSaveTimer: ReturnType<typeof setTimeout> | null = null

function scheduleTabSave(tabs: Tab[], activeTabId: string | null): void {
  if (tabSaveTimer !== null) clearTimeout(tabSaveTimer)
  tabSaveTimer = setTimeout(() => {
    const sessionTabs = tabs.map((t) => ({ path: t.path, encoding: t.encoding, eol: t.eol }))
    const activeTab = tabs.find((t) => t.id === activeTabId)
    void window.api.invoke('session:save', {
      session: { tabs: sessionTabs, activeTabPath: activeTab?.path }
    })
  }, 500)
}

interface OpenTabArgs {
  path: string
  content: string
  encoding: Encoding
  eol: 'LF' | 'CRLF'
  mtime: number
}

interface CloseTabOpts {
  force?: boolean
}

interface SaveTabOpts {
  force?: boolean
}

interface EditorState {
  tabs: Tab[]
  activeTabId: string | null
  openTab: (file: OpenTabArgs) => void
  closeTab: (id: string, opts?: CloseTabOpts) => Promise<boolean>
  closeTabByPath: (path: string) => void
  updateContent: (id: string, content: string) => void
  reloadTab: (id: string) => Promise<void>
  saveTab: (id: string, opts?: SaveTabOpts) => Promise<void>
  saveAllDirty: () => Promise<void>
  setActiveTab: (id: string) => void
  setViewState: (id: string, viewState: unknown) => void
  renameTab: (oldPath: string, newPath: string) => void
  setTabEncoding: (id: string, encoding: Encoding) => void
  setTabEol: (id: string, eol: EOL) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  openTab: (file) => {
    const { tabs } = get()
    const existing = tabs.find((t) => t.path === file.path)
    if (existing) {
      set({ activeTabId: existing.id })
      scheduleTabSave(tabs, existing.id)
      return
    }
    const id = crypto.randomUUID()
    const title = file.path.split('/').pop() ?? file.path
    const newTab: Tab = {
      id,
      path: file.path,
      title,
      content: file.content,
      isDirty: false,
      encoding: file.encoding,
      eol: file.eol,
      mtime: file.mtime
    }
    const nextTabs = [...tabs, newTab]
    set({ tabs: nextTabs, activeTabId: id })
    scheduleTabSave(nextTabs, id)
  },

  closeTab: async (id, opts) => {
    const { tabs } = get()
    const tab = tabs.find((t) => t.id === id)
    if (!tab) return true
    if (tab.isDirty && !opts?.force) return false

    const remaining = tabs.filter((t) => t.id !== id)
    const { activeTabId } = get()
    const nextActive =
      activeTabId === id ? (remaining[remaining.length - 1]?.id ?? null) : activeTabId
    set({ tabs: remaining, activeTabId: nextActive })
    scheduleTabSave(remaining, nextActive)
    return true
  },

  updateContent: (id, content) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, content, isDirty: true } : t))
    }))
  },

  reloadTab: async (id) => {
    const { tabs } = get()
    const tab = tabs.find((t) => t.id === id)
    if (!tab) return
    const res = (await window.api.invoke('fs:readFile', { path: tab.path })) as
      | { ok: true; content: string; mtime: number }
      | { ok: false }
    if (!res.ok) return
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === id ? { ...t, content: res.content, isDirty: false, mtime: res.mtime } : t
      )
    }))
  },

  saveTab: async (id) => {
    const { tabs } = get()
    const tab = tabs.find((t) => t.id === id)
    if (!tab) return
    markSelfSaved(tab.path)
    await window.api.invoke('fs:writeFile', {
      path: tab.path,
      content: tab.content,
      encoding: tab.encoding
    })
    const stat = (await window.api.invoke('fs:stat', { path: tab.path })) as
      | { ok: true; mtime: number }
      | { ok: false }
    const mtime = stat.ok ? stat.mtime : tab.mtime
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, isDirty: false, mtime } : t))
    }))
  },

  saveAllDirty: async () => {
    const { tabs, saveTab } = get()
    const dirty = tabs.filter((t) => t.isDirty)
    await Promise.allSettled(dirty.map((t) => saveTab(t.id)))
  },

  setActiveTab: (id) => {
    set({ activeTabId: id })
  },

  setViewState: (id, viewState) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, viewState } : t))
    }))
  },

  closeTabByPath: (path) => {
    const { tabs, activeTabId } = get()
    const tab = tabs.find((t) => t.path === path)
    if (!tab) return
    const remaining = tabs.filter((t) => t.path !== path)
    const nextActive =
      activeTabId === tab.id ? (remaining[remaining.length - 1]?.id ?? null) : activeTabId
    set({ tabs: remaining, activeTabId: nextActive })
    scheduleTabSave(remaining, nextActive)
  },

  renameTab: (oldPath, newPath) => {
    const title = newPath.split('/').pop() ?? newPath
    set((state) => ({
      tabs: state.tabs.map((t) => (t.path === oldPath ? { ...t, path: newPath, title } : t))
    }))
    const { tabs, activeTabId } = get()
    scheduleTabSave(tabs, activeTabId)
  },

  setTabEncoding: (id, encoding) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, encoding, isDirty: true } : t))
    }))
    const { tabs, activeTabId } = get()
    scheduleTabSave(tabs, activeTabId)
  },

  setTabEol: (id, eol) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, eol, isDirty: true } : t))
    }))
    const { tabs, activeTabId } = get()
    scheduleTabSave(tabs, activeTabId)
  }
}))
