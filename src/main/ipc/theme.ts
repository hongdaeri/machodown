import { ipcMain, nativeTheme } from 'electron'
import log from 'electron-log/main'

export function registerThemeHandlers(): void {
  ipcMain.handle('nativeTheme:get', () => {
    try {
      return { ok: true, dark: nativeTheme.shouldUseDarkColors }
    } catch (err: unknown) {
      log.error('nativeTheme:get failed', err)
      return { ok: false, dark: false }
    }
  })
}
