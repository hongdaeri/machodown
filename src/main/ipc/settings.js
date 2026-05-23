import { ipcMain, app } from 'electron'
import fs from 'fs/promises'
import { join } from 'path'
import log from 'electron-log/main'
const CONFIG_PATH = join(app.getPath('userData'), 'config.json')
const DEFAULT_SETTINGS = {
  editor: {
    fontSize: 14,
    fontFamily: 'JetBrains Mono, Menlo, Monaco, monospace',
    tabSize: 2,
    wordWrap: 'on',
    lineNumbers: 'on',
    minimap: { enabled: false },
    autoSave: { enabled: true, debounceMs: 500 }
  },
  theme: 'system',
  locale: 'ko',
  sidebar: { width: 240, visible: true },
  preview: { visible: true, syncScroll: true }
}
export function registerSettingsHandlers() {
  ipcMain.handle('settings:get', async () => {
    try {
      const raw = await fs.readFile(CONFIG_PATH, 'utf-8')
      const versioned = JSON.parse(raw)
      return { ok: true, settings: versioned.data ?? versioned }
    } catch {
      return { ok: true, settings: DEFAULT_SETTINGS }
    }
  })
  ipcMain.handle('settings:set', async (_, args) => {
    try {
      let current = DEFAULT_SETTINGS
      try {
        const raw = await fs.readFile(CONFIG_PATH, 'utf-8')
        const versioned = JSON.parse(raw)
        current = versioned.data ?? versioned
      } catch {
        // use defaults
      }
      const merged = deepMerge(current, args.settings)
      const versioned = {
        $schema: 1,
        $appVersion: app.getVersion(),
        $updatedAt: Date.now(),
        data: merged
      }
      const tmpPath = `${CONFIG_PATH}.tmp`
      await fs.writeFile(tmpPath, JSON.stringify(versioned, null, 2), 'utf-8')
      await fs.rename(tmpPath, CONFIG_PATH)
      return { ok: true, settings: merged }
    } catch (err) {
      log.error('settings:set failed', err)
      return { ok: false, message: err.message }
    }
  })
}
function deepMerge(target, source) {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    const sv = source[key]
    const tv = target[key]
    if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object') {
      result[key] = deepMerge(tv, sv)
    } else {
      result[key] = sv
    }
  }
  return result
}
