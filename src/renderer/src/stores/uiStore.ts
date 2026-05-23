import { create } from 'zustand'
import { Toast, ModalState, ModalType, TocItem } from './types'

export type ViewMode = 'split' | 'editor' | 'preview'
export type SidebarTab = 'explorer' | 'search'

interface SessionTab {
  path: string
  encoding: string
  eol: string
}

interface SessionData {
  editorWidth: number | undefined
  sidebarWidth: number
  viewMode: ViewMode
  sidebarVisible: boolean
  tabs?: SessionTab[]
  activeTabPath?: string | undefined
}

interface SessionGetResult {
  ok: boolean
  session: SessionData
}

interface UiState {
  toasts: Toast[]
  modal: ModalState
  editorWidth: number | undefined
  sidebarWidth: number
  sidebarVisible: boolean
  viewMode: ViewMode
  toc: TocItem[]
  tocVisible: boolean
  revealEditorLine: ((line: number) => void) | null
  sidebarTab: SidebarTab
  cursorLine: number
  cursorCol: number
  setSidebarTab: (tab: SidebarTab) => void
  setCursorPosition: (line: number, col: number) => void
  pushToast: (toast: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void
  openModal: (type: ModalType, props?: Record<string, unknown>) => void
  closeModal: () => void
  setEditorWidth: (w: number) => void
  setSidebarWidth: (w: number) => void
  toggleSidebar: () => void
  setViewMode: (mode: ViewMode) => void
  loadSession: () => Promise<SessionData | null>
  setToc: (toc: TocItem[]) => void
  toggleToc: () => void
  registerRevealLine: (fn: ((line: number) => void) | null) => void
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

function scheduleSave(data: SessionData): void {
  if (saveTimer !== null) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    void window.api.invoke('session:save', { session: data })
  }, 500)
}

export const useUiStore = create<UiState>((set, get) => ({
  toasts: [],
  modal: { type: null },
  editorWidth: undefined,
  sidebarWidth: 240,
  sidebarVisible: true,
  viewMode: 'editor',
  toc: [],
  tocVisible: true,
  revealEditorLine: null,
  sidebarTab: 'explorer',
  cursorLine: 1,
  cursorCol: 1,

  pushToast: (toast) => {
    const id = crypto.randomUUID()
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
  },

  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },

  openModal: (type, props) => {
    set({ modal: { type, props } })
  },

  closeModal: () => {
    set({ modal: { type: null } })
  },

  setEditorWidth: (w) => {
    set({ editorWidth: w })
    const s = get()
    scheduleSave({
      editorWidth: w,
      sidebarWidth: s.sidebarWidth,
      viewMode: s.viewMode,
      sidebarVisible: s.sidebarVisible
    })
  },

  setSidebarWidth: (w) => {
    set({ sidebarWidth: w })
    const s = get()
    scheduleSave({
      editorWidth: s.editorWidth,
      sidebarWidth: w,
      viewMode: s.viewMode,
      sidebarVisible: s.sidebarVisible
    })
  },

  toggleSidebar: () => {
    set((state) => {
      const sidebarVisible = !state.sidebarVisible
      scheduleSave({
        editorWidth: state.editorWidth,
        sidebarWidth: state.sidebarWidth,
        viewMode: state.viewMode,
        sidebarVisible
      })
      return { sidebarVisible }
    })
  },

  setViewMode: (mode) => {
    set({ viewMode: mode })
    const s = get()
    scheduleSave({
      editorWidth: s.editorWidth,
      sidebarWidth: s.sidebarWidth,
      viewMode: mode,
      sidebarVisible: s.sidebarVisible
    })
  },

  loadSession: async () => {
    const result = (await window.api.invoke('session:get')) as SessionGetResult
    if (result.ok) {
      set({
        editorWidth: result.session.editorWidth,
        sidebarWidth: result.session.sidebarWidth,
        viewMode: result.session.viewMode,
        sidebarVisible: result.session.sidebarVisible
      })
      return result.session
    }
    return null
  },

  setSidebarTab: (tab) => set({ sidebarTab: tab }),

  setCursorPosition: (line, col) => set({ cursorLine: line, cursorCol: col }),

  setToc: (toc) => set({ toc }),

  toggleToc: () => set((state) => ({ tocVisible: !state.tocVisible })),

  registerRevealLine: (fn) => set({ revealEditorLine: fn })
}))
