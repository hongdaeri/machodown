import { create } from 'zustand'

export interface AppSettings {
  editor: {
    fontSize: number
    fontFamily: string
    tabSize: number
    wordWrap: 'on' | 'off' | 'wordWrapColumn' | 'bounded'
    lineNumbers: 'on' | 'off' | 'relative' | 'interval'
    minimap: { enabled: boolean }
    autoSave: { enabled: boolean; debounceMs: number }
  }
  theme: 'light' | 'dark' | 'system'
  accentColor: 'macho-claude' | 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'teal'
  locale: string
  sidebar: { width: number; visible: boolean }
  preview: { visible: boolean; syncScroll: boolean; katex: boolean }
}

const DEFAULT_SETTINGS: AppSettings = {
  editor: {
    fontSize: 20,
    fontFamily: 'JetBrains Mono, Menlo, Monaco, monospace',
    tabSize: 2,
    wordWrap: 'on',
    lineNumbers: 'on',
    minimap: { enabled: false },
    autoSave: { enabled: true, debounceMs: 500 }
  },
  theme: 'system',
  accentColor: 'macho-claude',
  locale: 'ko',
  sidebar: { width: 240, visible: true },
  preview: { visible: true, syncScroll: true, katex: true }
}

interface SettingsState {
  settings: AppSettings
  initialized: boolean
  load: () => Promise<void>
  update: (patch: Partial<AppSettings>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  initialized: false,

  load: async () => {
    const result = (await window.api.invoke('settings:get')) as
      | { ok: true; settings: AppSettings }
      | { ok: false; message: string }
    if (result.ok) {
      set({ settings: result.settings, initialized: true })
    } else {
      set({ initialized: true })
    }
  },

  update: async (patch) => {
    const merged = { ...get().settings, ...patch }
    set({ settings: merged })
    await window.api.invoke('settings:set', { settings: merged })
  }
}))
