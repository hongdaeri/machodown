import { create } from 'zustand'
const DEFAULT_SETTINGS = {
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
  accentColor: 'blue',
  locale: 'ko',
  sidebar: { width: 240, visible: true },
  preview: { visible: true, syncScroll: true, katex: true }
}
export const useSettingsStore = create((set, get) => ({
  settings: DEFAULT_SETTINGS,
  initialized: false,
  load: async () => {
    const result = await window.api.invoke('settings:get')
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
