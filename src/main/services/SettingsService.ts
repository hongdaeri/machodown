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
  locale: string
  sidebar: { width: number; visible: boolean }
  preview: { visible: boolean; syncScroll: boolean }
}
